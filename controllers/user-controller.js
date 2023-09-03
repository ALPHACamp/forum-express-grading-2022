const bcrypt = require('bcryptjs') // 載入 bcrypt
const db = require('../models')
const { User } = db
const {getUser} = require('../helpers/auth-helpers')
const { localFileHandler } = require('../helpers/file-helpers') // 將 file-helper 載進來
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
    const editPermission = (Number(req.params.id) === Number(getUser(req).id))
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        res.render('users/profile', { user, editPermission })
      })
      .catch(err => next(err))
  },
  editUser:(req,res,next)=>{
    return User.findByPk(req.params.id, { raw: true })
      .then((user) => {
        if (!user) throw new Error('user did not exists!')
        res.render('users/edit', {user})
      })
      .catch(err => next(err))
  },
  putUser:(req,res,next)=>{
    const {name} =req.body
    if (!name) throw new Error('user name is required!')
    const {file} = req
    if (req.user.id !== Number(getUser(req).id)) {
      req.flash('error_messages', '非本人不得更改profile')
      res.redirect('/restaurants')
    }
    return Promise.all([ // 非同步處理
      User.findByPk(req.params.id), // 去資料庫查有沒有這個使用者
      localFileHandler(file) // 把檔案傳到 file-helper 處理 
    ])
    .then(([user,filepath]) => {
      if (!user) throw new Error('user did not exists!')
      return user.update({
        name, image:filepath||user.image})
    })
    .then((user) => {
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${req.params.id}`)
    })
    .catch(err => next(err))

  }
    
    
}
module.exports = userController
