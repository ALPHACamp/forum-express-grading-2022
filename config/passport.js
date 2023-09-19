const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', 'Account or password incorrect!'))
        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', 'Account or password incorrect!'))
          return cb(null, user)
        })
      })
  }
))
// serialize and deserialize user
// 序列化」的作法是只存 user id，不存整個 user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
// 反序列化」就是透過 user id，把整個 user 物件實例拿出來
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    return cb(null, user)
  })
})
module.exports = passport
