'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('assets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      type: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      model: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      serial_number: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      processor: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ssd: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      hdd: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ram: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      graphics_card: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      monitor: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      imei_1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      imei_2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      internal_memory: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      external_memory: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('assets');
  }
};
