'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user_departments', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'The deletion timestamp for soft delete functionality',
    });

    await queryInterface.addColumn('user_departments', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the user-department relationship is active',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_departments', 'is_active');
    await queryInterface.removeColumn('user_departments', 'deleted_at');
  }
};
