const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
const upload = require('../../middleware/multer') // 載入 multer

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant) // 新增這一行
router.get('/restaurants/:id', adminController.getRestaurant) // 新增這一行
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant) // 修改後台編輯餐廳的路由

router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // 修改後台新增餐廳的路由

router.use('/', (req, res) => res.redirect('/admin/restaurants'))
module.exports = router
