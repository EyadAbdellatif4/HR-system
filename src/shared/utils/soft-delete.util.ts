import { Op, Sequelize, Transaction } from 'sequelize';
import { Attachment } from '../database/entities/attachment.entity';

/**
 * Soft delete all attachments for an entity
 * Time Complexity: O(1) - single update query with indexed lookup
 * @param entityId - The ID of the entity
 * @param entityType - The type of entity ('assets' | 'users')
 * @param transaction - Optional Sequelize transaction
 * @returns Promise<void>
 */
export async function softDeleteEntityAttachments(
  entityId: string,
  entityType: 'assets' | 'users',
  transaction?: Transaction
): Promise<void> {
  await Attachment.update(
    { deleted_at: new Date(), is_active: false },
    {
      where: {
        entity_id: entityId,
        entity_type: entityType,
        is_active: true,
        [Op.and]: [
          Sequelize.literal('deleted_at IS NULL'),
        ],
      } as any,
      transaction,
      paranoid: false, // We're handling deleted_at manually
    }
  );
}

