const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

const SESSION_SECRET = 'secret'

// 註冊 Handlebars engine，副檔名設定hbs
app.engine('hbs', handlebars({ extname: 'hbs' }))
// 設定使用 Handlebars作為template engine
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})
app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
