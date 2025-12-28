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

    // Get asset IDs
    const assets = await queryInterface.sequelize.query(
      "SELECT id FROM assets ORDER BY id LIMIT 2",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (assets.length === 0) {
      throw new Error('Assets not found. Please run assets seed first.');
    }

    await queryInterface.bulkInsert('asset_tracking', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        asset_id: assets[0].id,
        user_id: user.id,
        assigned_at: new Date('2025-01-01'),
        removed_at: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        asset_id: assets[1].id,
        user_id: user.id,
        assigned_at: new Date('2025-01-15'),
        removed_at: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('asset_tracking', null, {});
  }
};
