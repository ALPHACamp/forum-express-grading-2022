const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
const categoryController = require("../../controllers/category-controller");
const upload = require('../../middleware/multer') // 載入 multer

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant) // 新增這一行
router.get('/restaurants/:id', adminController.getRestaurant) // 新增這一行
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant) // 修改後台編輯餐廳的路由

router.delete('/restaurants/:id', adminController.deleteRestaurant)
// 修改使用者權限
router.patch('/users/:id', adminController.patchUser)
// 顯示使用者清單
router.get('/users', adminController.getUsers)

router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // 修改後台新增餐廳的路由
router.get("/categories", categoryController.getCategories);

router.use('/', (req, res) => res.redirect('/admin/restaurants'))
module.exports = router
