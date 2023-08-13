// 載入外部套件
const path = require('path')
const express = require('express')
const handlebars = require('express-handlebars')
// 提示訊息
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')
const routes = require('./routes')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'
const db = require('./models')

// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
// 設定使用 Handlebars 做為樣板引擎
app.set('view engine', 'hbs')
// body-parser
app.use(express.urlencoded({ extended: true }))

app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
)
// Passport
app.use(passport.initialize()) // 初始化 Passport
app.use(passport.session()) // 啟動 session 功能

app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
  // 所有的 view 都能存取
  res.locals.user = getUser(req)
  next()
})
// route
app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
