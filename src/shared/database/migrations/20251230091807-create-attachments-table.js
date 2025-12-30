'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'The ID of the entity (user UUID or asset UUID as string)',
      },
      entity_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'The type of entity: "users" or "assets"',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'The name of the file without extension',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'The MIME type of the file (e.g., image/jpeg, application/pdf)',
      },
      extension: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'The file extension (e.g., .jpg, .pdf)',
      },
      path_URL: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The path URL of the file relative to the files folder',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add index for better query performance
    await queryInterface.addIndex('attachments', ['entity_id', 'entity_type'], {
      name: 'attachments_entity_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  }
};
