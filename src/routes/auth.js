const Router = require('express').Router
const { guard } = require('../middlewares/auth')
const AuthService = require('../services/auth')
const { wrapAsyncController } = require('../helpers')

const router = Router()

router.post('/login', wrapAsyncController(async (req, res) => {
  const user = await AuthService.attempt({
    username: req.body.username,
    password: req.body.password
  })

  if (!user) {
    return res.status(422).send({
      messages: ['Username or password is wrong']
    })
  }

  res.status(200).send({
    user,
    token: await AuthService.createJWT(user)
  })
}))

router.get('/refresh', guard, wrapAsyncController(async (req, res) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized')
  }

  res.status(200).send({
    user: req.user,
    token: await AuthService.createJWT(req.user)
  })
}))

module.exports = router
