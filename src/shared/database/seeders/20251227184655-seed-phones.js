'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get user ID (eyad user)
    const [user] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'eyad@gmail.com' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) {
      throw new Error('User not found. Please run users seed first.');
    }

    await queryInterface.bulkInsert('phones', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        number: '+1234567890',
        company: 'Verizon',
        current_plan: 'Unlimited Plan',
        legal_owner: 'Company',
        comment: 'Company provided phone',
        is_active: true,
        user_id: user.id,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        number: '+0987654321',
        company: 'AT&T',
        current_plan: 'Business Plan',
        legal_owner: 'Company',
        comment: 'Secondary phone',
        is_active: true,
        user_id: user.id,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('phones', null, {});
  }
};
