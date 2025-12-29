'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add is_active column to users table
    const usersTable = await queryInterface.describeTable('users');
    if (!usersTable.is_active) {
      await queryInterface.addColumn('users', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove is_active column
    const usersTable = await queryInterface.describeTable('users');
    if (usersTable.is_active) {
      await queryInterface.removeColumn('users', 'is_active');
    }
  }
};

