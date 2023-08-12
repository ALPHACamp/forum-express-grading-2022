const { Restaurant, User, Comment } = require('../models')

const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error('User didnt exist!')
        if (!restaurant) throw new Error('Restaurant didnt exist!')
        return Comment.create({ text, restaurantId, userId })
      })
      .then(() => res.redirect(`restaurants/${restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController
