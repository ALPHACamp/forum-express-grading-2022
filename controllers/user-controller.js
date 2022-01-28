const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res, next) => {
    const { name, email, password, passwordCheck } = req.body

    if (password !== passwordCheck) throw new Error('Passwords do not match!')
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')

        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({ name, email, password: hash }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號!')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },

  signinPage: (req, res) => {
    return res.render('signin')
  },

  signin: (req, res) => {
    req.flash('success_messages', '登入成功!')
    return res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    return res.redirect('/signin')
  },

  getUser: (req, res, next) => {
    // since R03.test.js uses custom request,
    // so we have req.params as fallback
    const { id } = req.user || req.params

    return User.findByPk(id, { raw: true })
      .then(user => {
        if (!user) throw new Error("User doesn't exist")

        return res.render('users/profile', { user })
      })
      .catch(err => next(err))
  },

  editUser: (req, res, next) => {
    // since R03.test.js uses custom request,
    // so we have req.params as fallback
    const { id } = req.user || req.params

    return User.findByPk(id, { raw: true })
      .then(user => {
        if (!user) throw new Error("User doesn't exist")

        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },

  putUser: (req, res, next) => {
    // since R03.test.js uses custom request,
    // so we have req.params as fallback
    const { id } = req.user || req.params

    const { name } = req.body
    const { file } = req

    return Promise.all([
      User.findByPk(id), imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User doesn't exist")

        return user.update({
          name, image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        return res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))
  }
}

module.exports = userController
