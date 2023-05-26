const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant, Favorite } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const userController = {
  // 註冊頁面
  signUpPage: (req, res) => {
    res.render('signup')
  },
  // 註冊功能
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個Error物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')
    // 確認資料裡面沒有一樣的email,若有就 建立一個Error物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號')
        res.redirect('/signin')
      })
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的middleware
  },
  // 登入頁面
  signInPage: (req, res) => {
    res.render('signin')
  },
  // 登入功能
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功!')
    res.redirect('/restaurants')
  },
  // 登出功能
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },
  getUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [{ model: Comment, include: Restaurant }], nest: true })
      // const restaurant = await Restaurant.findByPk(user.Comment)
      // console.log(user.Restaurant)
      if (!user) throw new Error("User didn't exist!")
      if (req.user) {
        if (user.id !== req.user.id) {
          return res.redirect(`/users/${req.user.id}`)
        }
      }
      res.render('users/profile', { user: user.toJSON() })
    } catch (err) { next(err) }
  },
  editUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { raw: true })
      if (!user) throw new Error("User didn't exist!")
      if (req.user) {
        if (user.id !== req.user.id) throw new Error("User can't modify others profile")
      }
      res.render('users/edit', { user })
    } catch (err) { next(err) }
  },
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      if (!name) throw new Error('User name is required!')
      const { file } = req
      const user = await User.findByPk(req.params.id)
      if (!user) throw new Error("User didn't exist!")
      const filePath = await imgurFileHandler(file)
      if (user.id !== req.user.id) { throw new Error("User can't modify others profile") }
      await user.update({ name, image: filePath || user.image })
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${user.id}`)
    } catch (err) { next(err) }
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Promise.all([Restaurant.findByPk(restaurantId), Favorite.findOne({ where: { userId, restaurantId } })])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')
        return Favorite.create({ userId, restaurantId })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({ where: { userId: req.user.id, restaurantId: req.params.restaurantId } })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
