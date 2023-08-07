
const { Comment, User, Restaurant } = require('../models')

const commentController = {
  // (功能)新增評論
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id

    if (!text) throw new Error('Comment text is required!')
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Comment.create({ text, restaurantId, userId })
      })
      .then(() => {
        req.flash('success_messages', '新增評論成功！')
        return res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  }
}
module.exports = commentController
