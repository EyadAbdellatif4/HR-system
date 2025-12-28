'use strict';

const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get admin role ID
    const [adminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!adminRole) {
      throw new Error('Admin role not found. Please run roles seed first.');
    }

    // Hash password using SHA-256 (simple hash for seed data)
    // In production, use bcrypt or similar
    const password = '1q2w3e4r5t';
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        user_number: 'EMP001',
        username: 'eyad@gmail.com',
        password: hashedPassword,
        name: 'eyad',
        address: '123 Main Street, City, Country',
        work_location: 'hybrid',
        social_insurance: true,
        medical_insurance: true,
        join_date: '2025-01-01',
        contract_date: '2025-12-31',
        exit_date: null,
        role_id: adminRole.id,
        title_id: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
