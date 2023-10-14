const express = require('express')
const handlebars = require('express-handlebars') // 引入 express-handlebars
const routes = require('./routes')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'

app.engine('hbs', handlebars({ extname: '.hbs' })) // 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.set('view engine', 'hbs') // 設定使用 Handlebars 做為樣板引擎
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash()) // 掛載套件
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
  next()
})

app.use(routes)
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})

module.exports = app
