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

function wrapAsyncController (fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(err => {
      next(err)
    })
  }
}

module.exports = {
  wrapAsyncController,
  NotFoundError,
  InvalidError,
  PolicyError
}
