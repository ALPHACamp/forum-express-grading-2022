const { Restaurant, Category, Comment, User } = require('../models')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    return Promise.all([
      Restaurant.findAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
        },
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.increment('viewCounts') // 每進來一次就 increment viewCounts 這欄位
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', {
          restaurant
        })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
