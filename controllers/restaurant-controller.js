const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  // 瀏覽：全部餐廳
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: { // 新增查詢條件
          ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
  },
  // 瀏覽：個別餐廳
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User }
      ]
    })
      .then(restaurant => {
        // console.log(restaurant.Comments[0].dataValues)
        // 在抓取 Restaurant 資料時引入 Comment，在抓取 Comment 資料時引入 User，最後就能拿到 Comment 跟作者名稱
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.increment('viewCount')
      })
      .then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  // Dashboard：
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
