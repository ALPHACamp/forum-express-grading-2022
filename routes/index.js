const express = require('express')
const router = express.Router()

const restController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

// fallback路由，當匹配不到時就會執行這一行
// 跟router.get的差別在於get只有限定'/'，use的範圍相對廣泛
router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router
