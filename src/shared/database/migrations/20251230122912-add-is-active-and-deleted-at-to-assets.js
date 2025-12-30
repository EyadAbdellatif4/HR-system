'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('assets', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the asset is active',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('assets', 'is_active');
  }
};
