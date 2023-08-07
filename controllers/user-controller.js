const bcrypt = require('bcryptjs')
const { User, Restaurant, Comment } = require('../models')

const { imgurFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        image: 'https://media.istockphoto.com/id/1344552674/vector/account-icon-profile-icon-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=i_5sF8AFgX_ebEJgr05XbzHaofrB0-ujcmVM2XOHJSA='
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
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
    return User.findByPk(req.params.id, {
      include: [{ model: Comment, include: Restaurant }],
      nest: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist.")

        // const uniqueComments = []
        // const restaurantIds = new Set()

        // user.Comments.forEach(comment => {
        //   if (!restaurantIds.has(comment.Restaurant.id)) {
        //     restaurantIds.add(comment.Restaurant.id)
        //     uniqueComments.push(comment)
        //   }
        // })
        // user.Comments = uniqueComments

        // console.log(user.Comments)
        res.render('users/profile', { user: user.toJSON() })
      })
      .catch(err => next(err))
  },

  editUser: (req, res, next) => {
    // if (Number(req.params.id) !== req.user.id) throw new Error("Can't edit other's profile.")

    return User.findByPk(req.params.id, {
      raw: true,
      nest: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist.")

        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },

  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req

    if (!name) throw new Error('User name is required!')
    if (req.user.id !== Number(req.params.id)) throw new Error('User can only edit their own profile!')

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
      .catch(err => next(err))
  }
}

module.exports = userController
