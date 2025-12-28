'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('departments', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Engineering',
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Product',
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Human Resources',
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Finance',
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Sales',
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
