const { Restaurant, Category } = require('../models')
const restController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: Category,
      nest: true,
      raw: true
    }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50)
      }))
      return res.render('restaurants', { restaurants: data })
    })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: Category
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    })
      .then(restaurant => { return restaurant.increment('view_counts') })
      .then(restaurant => {
        return Restaurant.findByPk(restaurant.id, {
          include: Category
        })
      })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  }
  /* getDashboard: async (req, res, next) => {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: Category
    })
    const restaurantadd = restaurant.increment('view_counts')
    const restaurantCounts = await Restaurant.findByPk(restaurantadd.id, {
      include: Category
    })
    await res.render('dashboard', { restaurant: restaurantCounts.toJSON() })
  } */
}
module.exports = restController
