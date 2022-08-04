const helpers = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated) {
    if (helpers.getUser(req).isAdmin) return next()
    res.redirect('/')
  }
  res.redirect('/signin')
}

module.exports = {
  authenticated, authenticatedAdmin
}
