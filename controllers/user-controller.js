const assert = require('assert')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { getUser } = require('../helpers/auth-helpers')
const { User, Comment, Restaurant, Favorite } = db

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) {
      throw new Error('Passwords do not match!')
    }
    return User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash =>
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      )
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return Promise.all([
      User.findByPk(req.params.id, { raw: true }),
      Comment.findAndCountAll({
        where: { userId: req.params.id },
        include: Restaurant,
        nest: true,
        raw: true
      })
    ])
      .then(([userProfile, comments]) => {
        assert(userProfile, "User didn't exist!")
        if (!comments.rows.length) {
          comments = { ...comments, count: 0 }
        }
        res.render('users/profile', {
          user: getUser(req),
          userProfile,
          comments
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const user = getUser(req) // 取得passport驗證user
    const { id } = req.params // 使用者請求put的userId
    assert(user.id === Number(id), 'You can only edit your own profile.') // 使用者看不到其他user的edit頁面
    return User.findByPk(id, { raw: true })
      .then(user => {
        assert(user, "User didn't exist!")
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    assert(name, 'User name is required!')
    const { file } = req

    const user = getUser(req) // 取得passport驗證user
    const { id } = req.params // 使用者請求put的userId
    assert(user.id === Number(id), 'You can only edit your own profile')
    return Promise.all([User.findByPk(id), imgurFileHandler(file)])
      .then(([user, filePath]) => {
        assert(user, "User didn't exist!")
        return user.update({ name, image: filePath || user.image })
      })
      .then(user => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({ where: { userId: getUser(req).id, restaurantId } })
    ])
      .then(([restaurant, favorite]) => {
        assert(restaurant, "Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({ userId: getUser(req).id, restaurantId })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Favorite.findOne({ where: { userId: getUser(req).id, restaurantId } })
      .then(favorite => {
        assert(favorite, "You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
