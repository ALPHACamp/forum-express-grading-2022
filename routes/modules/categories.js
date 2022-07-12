const router = require('express').Router()
const categoryController = require('../../controllers/categoryController')

router.get('/', categoryController.getCategories)

module.exports = router
