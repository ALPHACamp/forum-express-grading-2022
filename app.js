const express = require('express')
const handlebars = require('express-handlebars')
const usePassport = require('./config/passport')
const session = require('express-session')
const flash = require('connect-flash')
const { getUser } = require('./helpers/auth-helpers')
const handlebarsHelpers = require('./helpers/handlebars-helper')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'SECRET'

app.engine(
  'hbs',
  handlebars({
    extname: '.hbs',
    helpers: handlebarsHelpers
  })
)
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  })
)
usePassport(app)
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.user = getUser(req)
  next()
})
app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
