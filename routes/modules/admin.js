const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

// create new restaurant
router.get('/restaurants/create', adminController.createRestaurant)
// one restaurant edit
router.get('/restaurants/:id/edit', adminController.editRestaurant)
// one restaurant detail
router.get('/restaurants/:id', adminController.getRestaurant)
// update one restaurant detail
router.put('/restaurants/:id', adminController.putRestaurant)
// delete one restaurant
router.delete('/restaurants/:id', adminController.deleteRestaurant)
// for admin home page
router.get('/restaurants', adminController.getRestaurants)
// create new restaurant and post it
router.post('/restaurants', adminController.postRestaurant)

router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
