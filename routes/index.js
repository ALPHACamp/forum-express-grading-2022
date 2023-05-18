const express = require('express')
const router = express.Router()
const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const passport = require('../config/passport')
const admin = require('./modules/admin')

// 後台
router.use('/admin', authenticatedAdmin, admin)
// 註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
// 登入登出
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)
// 瀏覽儀錶板
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
// 瀏覽單一餐廳
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// 瀏覽所有餐廳
router.get('/restaurants', authenticated, restController.getRestaurants)
router.use('/', (req, res) => res.redirect('/restaurants'))
// 錯誤處理
router.use('/', generalErrorHandler)
module.exports = router
