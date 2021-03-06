const ValidationError = require('mongoose').Error.ValidationError
const { NotFoundError, InvalidError, PolicyError } = require('../helpers')

module.exports = {
  errorHandler (err, req, res, next) {
    if (err instanceof ValidationError) {
      const errorObj = {}

      Object.keys(err.errors).forEach(key => {
        errorObj[key] = err.errors[key].properties
      })

      return res.status(422).send(errorObj)
    }

    if (err instanceof NotFoundError) {
      return res.sendStatus(404)
    }

    if (err instanceof InvalidError) {
      return res.sendStatus(400)
    }

    if (err instanceof PolicyError) {
      return res.sendStatus(403)
    }

    if (err.name === 'JsonWebTokenError') {
      return res.sendStatus(401)
    }

    res.sendStatus(500)
  }
}
