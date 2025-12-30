'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('attachments', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the attachment is active',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('attachments', 'is_active');
  }
};
