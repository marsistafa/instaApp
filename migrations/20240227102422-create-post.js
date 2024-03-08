'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PostID: {
        type: Sequelize.INTEGER
      },
      UserID: {
        type: Sequelize.TEXT
      },
      Published: {
        type: Sequelize.BOOLEAN
      },
      PageID: {
        type: Sequelize.TEXT
      },
      Content: {
        type: Sequelize.TEXT
      },
      ScheduledTime: {
        type: Sequelize.TIME
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};