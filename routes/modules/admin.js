const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.get('/restaurants', adminController.getRestaurants) // 修改這行，新增 authenticatedAdmin 參數
router.post('/restaurants', adminController.postRestaurant)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))
module.exports = router
