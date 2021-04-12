const Router = require('express').Router
const { guard } = require('../middlewares/auth')
const { errorResponseCatcher } = require('../helpers')
const UserService = require('../services/user')

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

router.get('/', guard, async (req, res) => {
  try {
    const users = await UserService.find({
      page: req.query.page,
      perPage: req.query.per_page
    }, {
      policy: isAdmin(req.user)
    })

    res.status(200).send(users)
  } catch (err) {
    if (errorResponseCatcher(err, res)) return null
    res.sendStatus(500)
  }
})

router.post('/', guard, async (req, res) => {
  try {
    const user = await UserService.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || 'user'
    }, {
      policy: isAdmin(req.user)
    })

    res.status(201).send(user)
  } catch (err) {
    if (errorResponseCatcher(err, res)) return null
    res.sendStatus(500)
  }
})

router.get('/me', guard, (req, res) => {
  //
})

router.get('/:id', guard, async (req, res) => {
  try {
    const user = await UserService.findById(req.params.id, {
      policy: isAdminOrIsOwn(req.user)
    })

    res.status(200).send(user)
  } catch (err) {
    if (errorResponseCatcher(err, res)) return null
    res.sendStatus(500)
  }
})

router.put('/:id', guard, async (req, res) => {
  try {
    const user = await UserService.updateById(req.params.id, {
      username: req.body.username,
      password: req.body.password,
      role: req.body.role
    }, {
      policy: isAdminOrIsOwn(req.user, req.body)
    })

    if (!user) {
      return res.status(404).send('Not found!')
    }

    res.status(200).send(user)
  } catch (err) {
    if (errorResponseCatcher(err, res)) return null
    res.sendStatus(500)
  }
})

router.delete('/:id', guard, async (req, res) => {
  try {
    const user = await UserService.removeById(req.params.id, {
      policy: isAdminOrIsOwn(req.user)
    })

    res.status(200).send(user)
  } catch (err) {
    if (errorResponseCatcher(err, res)) return null
    res.sendStatus(500)
  }
})

module.exports = router
