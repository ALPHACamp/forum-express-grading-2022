const express = require('express')
const router = express.Router()
const restController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')
const passport = require('../config/passport')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler') // 須將middleware加入
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

// 現在收到的請求如果帶有 /admin 的路徑，就一律丟給後台專用的 admin 這個 module 去處理，若是其他情況再依序往下判斷。(使用router.use )。使用authenticatedAdmin驗證是否為admin。
router.use('/admin', authenticatedAdmin, admin)
// 註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)// 使用post處理signup的動作
// 登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// 登出
router.get('/logout', userController.logout)

router.get('/restaurants', authenticated, restController.getRestaurants)
// 如果接收到的請求路徑是 / restaurants，那就交給 controller 的 getRestaurants 函式來處理。如果這行路由和請求匹配成功，以下的 router.get 就不會執行。

// fallback路由。當其他路由條件都不符合時，最終會通過的路由。論此 request 是用哪個 HTTP method 發出的，都會匹配到這一行，將使用者重新導回 / restaurants。所以要注意順序。所以就是不論你網址亂打甚麼，他都會跳去/restaurants。
router.use('/', (req, res) => { res.redirect('/restaurants') })

router.use('/', generalErrorHandler) // 須將middleware加入，不然無法顯示

module.exports = router
