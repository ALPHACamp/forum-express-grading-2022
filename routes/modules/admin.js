const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

// 新增餐廳
router.get('/restaurants/create', adminController.createRestaurant)
router.post('/restaurants', adminController.postRestaurant)

// 顯示所有餐廳
router.get('/restaurants', adminController.getRestaurants)

// 首頁路由
router.get('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
