const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const admin = require('./modules/admin')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated } = require('../middleware/auth')

router.use('/admin', admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn) // 注意是 post
router.get('/logout', userController.logout)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)
router.get('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler)

module.exports = router
