const express = require('express')
const router = express.Router()
const upload = require('../../middleware/multer')
const adminController = require('../../controllers/admin-controller')
const { authenticatedAdmin } = require('../../middleware/auth')
//
router.get('/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.get('/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.get('', (req, res) => res.redirect('/admin/restaurants'))
module.exports = router
