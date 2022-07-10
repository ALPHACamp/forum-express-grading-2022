const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
const categoryController = require('../../controllers/category-controller')
const upload = require('../../middleware/multer')
const { generalErrorHandler } = require('../../middleware/error-handler')

router.get('/restaurants/create', adminController.createRestaurant) // page of create
router.get('/restaurants/:rest_id/edit', adminController.editRestaurant) // page of edit
router.get('/restaurants/:rest_id', adminController.getRestaurant) // show a restaurant
router.put('/restaurants/:rest_id', upload.single('image'), adminController.putRestaurant) // update a restaurant
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant) // delete a restaurant
router.patch('/users/:user_id', adminController.patchUser) // switch admin <=> user
router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // create a restaurant
router.get('/restaurants', adminController.getRestaurants) // show all restaurants
router.get('/users', adminController.getUsers) // show all users

router.get('/categories/:cat_id', categoryController.getCategories) // show edit page
router.put('/categories/:cat_id', categoryController.putCategory) // update a category into database
router.delete('/categories/:cat_id', categoryController.deleteCategory) // delete a category from database
router.get('/categories', categoryController.getCategories) // show create page
router.post('/categories', categoryController.postCategory) // create new category into database
router.get('/', (req, res) => res.redirect('/admin/restaurants'))

router.use('/', generalErrorHandler)
module.exports = router
