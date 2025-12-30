'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('asset_tracking', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the asset tracking record is active',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('asset_tracking', 'is_active');
  }
};
