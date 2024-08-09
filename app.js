// const express = require('express')
// const handlebars = require('express-handlebars') // 引入 express-handlebars
// const flash = require('connect-flash')
// const session = require('express-session')
// const routes = require('./routes')
// const app = express()
// const port = process.env.PORT || 3000
// const SESSION_SECRET = 'secret'
// const passport = require('./config/passport')
// const { getUser } = require('./helpers/auth-helpers')
// const handlebarsHelpers = require('./helpers/handlebars-helpers')
// const methodOverride = require('method-override')
// const path = require('path')

// console.log(111)
// // 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
// app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
// // 設定使用 Handlebars 做為樣板引擎
// app.set('view engine', 'hbs')
// console.log(222)
// app.use(express.urlencoded({ extended: true }))
// app.use(
//   session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
// )
// console.log(333)
// app.use(passport.initialize())
// app.use(passport.session())
// console.log(444)
// app.use(flash())
// app.use(methodOverride('_method'))
// app.use('/upload', express.static(path.join(__dirname, 'upload')))

// console.log(555)
// app.use((req, res, next) => {
//   res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
//   res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
//   res.locals.user = getUser(req)
//   next()
// })

// app.use(routes)

// app.listen(port, () => {
//   console.info(`Example app listening on port ${port}!`)
// })

// module.exports = app

const express = require('express')
const app = express()

app.use(express.static('public')) // 确保静态文件中没有重定向问题

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// 确保其他路由不引发重定向循环
app.get('/redirect', (req, res) => {
  res.redirect('/')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

module.exports = app
