const ValidationError = require('mongoose').Error.ValidationError

class NotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

class InvalidError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidError'
  }
}

class PolicyError extends Error {
  constructor (message) {
    super(message)
    this.name = 'PolicyError'
  }
}

function errorResponseCatcher (err, res) {
  if (err instanceof ValidationError) {
    res.status(422).send(err.message)
    return true
  }

  if (err instanceof NotFoundError) {
    res.sendStatus(404)
    return true
  }

  if (err instanceof InvalidError) {
    res.sendStatus(400)
    return true
  }

  if (err instanceof PolicyError) {
    res.sendStatus(403)
    return true
  }

  return false
}

module.exports = {
  errorResponseCatcher,
  NotFoundError,
  InvalidError,
  PolicyError
}
