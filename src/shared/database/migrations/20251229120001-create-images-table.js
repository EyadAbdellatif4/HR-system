'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('images', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      owner_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      owner_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    // Add indexes for better query performance
    await queryInterface.addIndex('images', ['owner_id', 'owner_type'], {
      name: 'images_owner_idx',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('images');
  }
};

