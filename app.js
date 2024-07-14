const express = require('express')
const handlebars = require('express-handlebars')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000

// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('hbs', handlebars({ extname: '.hbs' }))
// 設定使用 Handlebars 做為樣板引擎
app.set('view engine', 'hbs')
app.use(routes)
app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app