const { ensureAuthenticated, getUser } = require('../helpers/auth-helper')

exports.authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) return next()

  res.redirect('/signin')
}

exports.authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) return next()
    else return res.redirect('/signin')
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
