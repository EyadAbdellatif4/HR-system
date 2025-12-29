'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Step 1: Create asset_type ENUM type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE asset_type_enum AS ENUM ('phone', 'mobile', 'laptop');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 2: Add asset_type column
    await queryInterface.addColumn('assets', 'asset_type', {
      type: Sequelize.ENUM('phone', 'mobile', 'laptop'),
      allowNull: true,
    });

    // Step 3: Add phone columns
    await queryInterface.addColumn('assets', 'phone_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('assets', 'phone_company', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('assets', 'phone_current_plan', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('assets', 'phone_legal_owner', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('assets', 'phone_comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Step 4: Rename columns with prefixes
    await queryInterface.renameColumn('assets', 'ssd', 'laptop_ssd');
    await queryInterface.renameColumn('assets', 'hdd', 'laptop_hdd');
    await queryInterface.renameColumn('assets', 'processor', 'laptop_processor');
    await queryInterface.renameColumn('assets', 'graphics_card', 'laptop_graphics_card');
    await queryInterface.renameColumn('assets', 'monitor', 'laptop_monitor');
    await queryInterface.renameColumn('assets', 'imei_1', 'mobile_imei_1');
    await queryInterface.renameColumn('assets', 'imei_2', 'mobile_imei_2');
    await queryInterface.renameColumn('assets', 'internal_memory', 'mobile_internal_memory');
    await queryInterface.renameColumn('assets', 'external_memory', 'mobile_external_memory');
  },

  async down (queryInterface, Sequelize) {
    // Rename columns back
    await queryInterface.renameColumn('assets', 'mobile_external_memory', 'external_memory');
    await queryInterface.renameColumn('assets', 'mobile_internal_memory', 'internal_memory');
    await queryInterface.renameColumn('assets', 'mobile_imei_2', 'imei_2');
    await queryInterface.renameColumn('assets', 'mobile_imei_1', 'imei_1');
    await queryInterface.renameColumn('assets', 'laptop_monitor', 'monitor');
    await queryInterface.renameColumn('assets', 'laptop_graphics_card', 'graphics_card');
    await queryInterface.renameColumn('assets', 'laptop_processor', 'processor');
    await queryInterface.renameColumn('assets', 'laptop_hdd', 'hdd');
    await queryInterface.renameColumn('assets', 'laptop_ssd', 'ssd');

    // Remove phone columns
    await queryInterface.removeColumn('assets', 'phone_comment');
    await queryInterface.removeColumn('assets', 'phone_legal_owner');
    await queryInterface.removeColumn('assets', 'phone_current_plan');
    await queryInterface.removeColumn('assets', 'phone_company');
    await queryInterface.removeColumn('assets', 'phone_number');

    // Remove asset_type column
    await queryInterface.removeColumn('assets', 'asset_type');

    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS asset_type_enum;
    `);
  }
};
