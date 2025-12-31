import { Sequelize, Transaction } from 'sequelize';

/**
 * Execute a function within a database transaction with automatic rollback on error
 * @param sequelize - Sequelize instance
 * @param callback - Function to execute within transaction
 * @returns Promise<T> - Result of the callback function
 */
export async function withTransaction<T>(
  sequelize: Sequelize,
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await sequelize.transaction();
  
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      // Transaction might already be rolled back, ignore
    }
    throw error;
  }
}

