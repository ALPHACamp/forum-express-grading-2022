const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: async (req, res, next) => {
    try {
      const resData = await Restaurant.findAll({
        include: Category,
        nest: true,
        raw: true
      })
      const restaurants = resData.map(res => ({
        ...res,
        description: res.description.substring(0, 50)
      }))
      res.render('restaurants', { restaurants })
    } catch (err) { next(err) }
  },
  getRestaurant: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: Category,
        nest: true,
        raw: true
      })
      if (!restaurant) throw new Error('Restaurant does not exist!')
      res.render('restaurant', { restaurant })
    } catch (err) { next(err) }
  }
}

module.exports = restaurantController
