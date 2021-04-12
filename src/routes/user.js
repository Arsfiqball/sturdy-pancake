const Router = require('express').Router
const { guard } = require('../middlewares/auth')
const UserService = require('../services/user')
const { wrapAsyncController } = require('../helpers')

const router = Router()

function isAdmin (requestedUser) {
  return () => {
    if (requestedUser.role === 'admin') return true
    return false
  }
}

function isAdminOrIsOwn (requestedUser, modify) {
  return (userInDatabase) => {
    if (requestedUser.role === 'admin') return true

    if (requestedUser.id === userInDatabase.id) {
      if (modify) {
        if (modify.role && modify.role !== userInDatabase.role) {
          return false
        }
      }

      return true
    }

    return false
  }
}

router.get('/', guard, wrapAsyncController(async (req, res) => {
  const users = await UserService.find({
    page: req.query.page,
    perPage: req.query.per_page
  }, {
    policy: isAdmin(req.user)
  })

  res.status(200).send(users)
}))

router.post('/', guard, wrapAsyncController(async (req, res) => {
  const user = await UserService.create({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role || 'user'
  }, {
    policy: isAdmin(req.user)
  })

  res.status(201).send(user)
}))

router.get('/me', guard, (req, res) => {
  //
})

router.get('/:id', guard, wrapAsyncController(async (req, res) => {
  const user = await UserService.findById(req.params.id, {
    policy: isAdminOrIsOwn(req.user)
  })

  res.status(200).send(user)
}))

router.put('/:id', guard, wrapAsyncController(async (req, res) => {
  const user = await UserService.updateById(req.params.id, {
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  }, {
    policy: isAdminOrIsOwn(req.user, req.body)
  })

  res.status(200).send(user)
}))

router.delete('/:id', guard, wrapAsyncController(async (req, res) => {
  const user = await UserService.removeById(req.params.id, {
    policy: isAdminOrIsOwn(req.user)
  })

  res.status(200).send(user)
}))

module.exports = router
