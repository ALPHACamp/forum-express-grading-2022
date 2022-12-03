const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { Restaurant, User } = require('../models')

// setup passport strategy
passport.use(new LocalStrategy(
  { // customize user Field
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) { return cb(null, false, req.flash('error_messages', '帳號或密碼錯誤!')) }
        bcrypt.compare(password, user.password).then(res => {
          if (!res) { return cb(null, false, req.flash('error_messages', '帳號或密碼錯誤!')) }
          return cb(null, user)
        })
      })
  }
))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' }
    ]
  }).then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
