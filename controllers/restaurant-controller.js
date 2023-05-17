const { Restaurant, Category } = require('../models')

const restaruantController = {
  getRestaurants: async (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    try {
      const restaurants = await Restaurant.findAll({
        where: { ...categoryId ? { categoryId } : {} },
        raw: true,
        next: true,
        include: Category
      })
      const categories = await Category.findAll({ raw: true })
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50)
      }))
      res.render('restaurants', { restaurants: data, categories, categoryId })
    } catch (e) {
      next(e)
    }
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category, // 拿出關聯的 Category model
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('restaurant', {
          restaurant: restaurant.toJSON()
        })
        return restaurant.increment('viewCounts')
      })
      .catch(err => next(err))
  },
  getDashboard: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [Category],
        raw: true,
        nest: true
      })
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      res.render('dashboard', { restaurant })
    } catch (e) { next(e) }
  }
}

module.exports = restaruantController
