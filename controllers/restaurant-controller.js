const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: async (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const DEFAULT_DESCRIPTION_MAX = 50
    // 取得參數: categoryId, page, limit
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    // 計算offset
    const offset = getOffset(limit, page)
    try {
      // 取出restaurants(含category)、categories
      const [restaurants, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          raw: true,
          nest: true,
          include: Category,
          // 判斷有無categoryId
          where: {
            ...(categoryId ? { categoryId } : {})
          },
          limit,
          offset
        }),
        Category.findAll({ raw: true })
      ])
      // 對於description進行處理(substring)
      const data = restaurants.rows.map(restaurant => ({
        ...restaurant,
        description: restaurant.description.substring(0, DEFAULT_DESCRIPTION_MAX)
      }))
      // render
      return res.render('restaurants', { restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count) })
    } catch (err) {
      next(err)
    }
  },
  getRestaurant: async (req, res, next) => {
    // 取出id值
    const { id } = req.params
    try {
      // 找出對應restaurant
      const restaurant = await Restaurant.findByPk(id, { nest: true, include: Category })
      // 找不到報錯
      if (!restaurant) throw new Error('Restaurant does not exist!')
      // 將viewCounts+1
      await restaurant.increment('viewCounts')
      // 找到就render，需加toJSON()
      return res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (err) {
      next(err)
    }
  },
  getDashboard: async (req, res, next) => {
    // id取出
    const { id } = req.params
    try {
      // 找出對應restaurant
      const restaurant = await Restaurant.findByPk(id, { raw: true, nest: true, include: Category })
      // 沒有就報錯
      if (!restaurant) throw new Error('Restaurant does not exist!')
      // 有就render
      return res.render('dashboard', { restaurant })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = restaurantController
