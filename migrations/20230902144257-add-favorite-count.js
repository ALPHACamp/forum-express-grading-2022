'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'num_Favorite', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'num_Favorite')
  }
}