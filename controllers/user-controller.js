const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db
const { imgurFileHandler } = require('../helpers/file-helpers')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入密碼不同，就建立一個Error物件
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    // 確認資料裡面沒有一樣的email，如果有就建立一個Error物件
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', 'Register email successfully!')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_message', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return db.sequelize.query(`
    WITH 
    comment_counts AS (SELECT user_id, restaurant_id, image AS rest_image FROM comments c JOIN restaurants r ON c.restaurant_id = r.id GROUP BY user_id, restaurant_id, rest_image)
    SELECT u.id, u.name, u.email,u.image, json_arrayagg(rest_image) rest_image, json_arrayagg(restaurant_id) restaurant_id
    FROM users u 
    LEFT JOIN comment_counts cc ON u.id = cc.user_id WHERE id = ${req.params.id}`, { type: db.sequelize.QueryTypes.SELECT })
      .then(user => {
        if (!user[0].id) throw new Error('沒有此使用者')
        return res.render('users/profile', { user: user[0] })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        if (!user) throw new Error('沒有此使用者')
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req
    if (!name) throw new Error('User name is required!')
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      })
  }
}
module.exports = userController
