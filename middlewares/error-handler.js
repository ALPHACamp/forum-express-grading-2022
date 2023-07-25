const { RegisterError, AdminError } = require('../errors/errors')
const generalErrorHandler = (err, req, res, next) => {
  switch (err.constructor) { // 用constructor來區分不同的錯誤
    case RegisterError:// 練習用自創error
      req.flash('error_messages', `Register Error: ${err.message}`)
      break
    case AdminError:
      req.flash('error_messages', `Admin Error: ${err.message}`)
      break
    case Error:
      req.flash('error_messages', `${err.name}: ${err.message}`)
      break
    default:
      req.flash('error_messages', `Non Error Class Error: ${err.message}`)
      break
  }
  res.redirect('back')// 回到上一頁
  return next(err)
}
module.exports = generalErrorHandler