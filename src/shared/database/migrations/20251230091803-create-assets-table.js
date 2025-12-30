'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create asset_type enum type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE asset_type_enum AS ENUM ('phone', 'mobile', 'laptop');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      asset_type: {
        type: Sequelize.ENUM('phone', 'mobile', 'laptop'),
        allowNull: true,
      },
      model: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      serial_number: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ram: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laptop_processor: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laptop_ssd: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laptop_hdd: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laptop_graphics_card: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laptop_monitor: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mobile_imei_1: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mobile_imei_2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mobile_internal_memory: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mobile_external_memory: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phone_company: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_current_plan: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_legal_owner: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS asset_type_enum');
  }
};
