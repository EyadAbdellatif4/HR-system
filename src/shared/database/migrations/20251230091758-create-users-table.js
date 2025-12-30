'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create work_location enum type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE work_location_enum AS ENUM ('in-office', 'hybrid', 'remote');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      user_number: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      work_location: {
        type: Sequelize.ENUM('in-office', 'hybrid', 'remote'),
        allowNull: false,
      },
      social_insurance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      medical_insurance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      join_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      contract_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      exit_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      personal_phone: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS work_location_enum');
  }
};
