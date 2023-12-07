const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！') // 並顯示成功訊息
        res.redirect('/signin')
      })
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
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
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("user doesn't exist!")
        res.render('users/profile', { user })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("user doesn't exist!")
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  // 自己原本的寫法，功能沒問題，但不知道為何沒辦法通過測試
  // putUser: (req, res, next) => {
  //   const { name } = req.body
  //   if (!name) throw new Error('User name is required!')
  //   const { file } = req
  //   Promise.all([
  //     User.findByPk(req.user.id),
  //     imgurFileHandler(file)
  //   ])
  //     .then(([user, filePath]) => {
  //       if (!user) throw new Error("User doesn't exist!")
  //       return user.update({
  //         name,
  //         image: filePath || user.image
  //       })
  //     })
  //     .then(() => {
  //       req.flash('success_messages', '使用者資料編輯成功')
  //       res.redirect(`/users/${req.user.id}`)
  //     })
  //     .catch(err => next(err))
  // }

  // putUser為別人的寫法
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      if (!name) throw new Error('Name為必填欄位')
      const { file } = req
      const user = await User.findByPk(req.params.id)
      if (!user) throw new Error('此user不存在')
      const filePath = await imgurFileHandler(file)
      await user.update({
        name,
        image: filePath || user.image
      })
      const userJson = user.toJSON()
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${userJson.id}`)
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
