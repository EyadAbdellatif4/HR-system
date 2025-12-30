'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('attachments', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'The deletion timestamp for soft delete functionality',
    });

    // Add index for better query performance on non-deleted records (partial index)
    await queryInterface.sequelize.query(
      `CREATE INDEX attachments_deleted_at_idx ON attachments (deleted_at) WHERE deleted_at IS NULL;`
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS attachments_deleted_at_idx;`
    );
    
    // Remove column
    await queryInterface.removeColumn('attachments', 'deleted_at');
  }
};

