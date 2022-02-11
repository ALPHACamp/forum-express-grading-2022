const { Category } = require('../models')

const categoryController = {
  getCategories: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => {
        return res.render('admin/categories', { categories })
      })
      .catch(err => next(err))
  }
}
module.exports = categoryController
