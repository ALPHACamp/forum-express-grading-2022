const express = require('express')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')

const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'

// set Handlebars
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

// body-parser
app.use(express.urlencoded({ extended: true }))

// session and flash
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(flash()) // 掛載套件
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')  // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages')  // 設定 warning_msg 訊息
  next()
})

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
