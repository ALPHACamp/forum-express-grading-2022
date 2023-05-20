const express = require('express')
const router = express.Router()
const { generalErrorHandler } = require('../middleware/error-handler')
const passport = require('../config/passport')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')
const admin = require('./modules/admin')
const { authenticated, adminAuthenticated } = require('../middleware/auth')
// 上傳圖片
const upload = require('../middleware/multer')

router.use('/admin', adminAuthenticated, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
)
router.get('/logout', userController.logout)

router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.delete('/comments/:id', adminAuthenticated, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', upload.single('image'), authenticated, userController.putUser)
router.get('/users/:id', authenticated, userController.getUser)

router.use('/', (req, res) => res.redirect('restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
