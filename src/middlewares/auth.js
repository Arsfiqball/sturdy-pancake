const AuthService = require('../services/auth')
const UserService = require('../services/user')

module.exports = {
  bearerJWT (req, res, next) {
    const { authorization } = req.headers

    if (authorization) {
      const [authType, token] = authorization.split(' ')

      if (authType === 'Bearer') {
        AuthService
          .verifyJWT(token)
          .then(({ sub }) => UserService.findById(sub))
          .then(user => {
            if (user) {
              req.user = user
            }

            next()
          })
          .catch(err => next(err))
      } else {
        next()
      }
    } else {
      next()
    }
  },

  guard (req, res, next) {
    if (!req.user) {
      return res.sendStatus(401)
    }

    next()
  }
}
