const ValidationError = require('mongoose').Error.ValidationError
const { NotFoundError, InvalidError, PolicyError } = require('../helpers')

module.exports = {
  errorHandler (err, req, res, next) {
    if (err instanceof ValidationError) {
      return res.status(422).send(err.message)
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

    res.sendStatus(500)
  }
}
