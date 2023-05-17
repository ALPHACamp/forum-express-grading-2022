if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const exphbs = require('express-handlebars')
const routers = require('./routes')
const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use('routes')

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
