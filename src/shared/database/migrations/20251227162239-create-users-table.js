'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create enum type for work_location
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE work_location_enum AS ENUM ('in-office', 'hybrid', 'remote');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_number: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      work_location: {
        type: Sequelize.ENUM('in-office', 'hybrid', 'remote'),
        allowNull: false
      },
      social_insurance: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      medical_insurance: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      join_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      contract_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      exit_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    // Drop enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS work_location_enum;');
  }
};
