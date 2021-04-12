const request = require('supertest')
const app = require('../src/app')
const { User } = require('../src/models/user')

module.exports = async function ({ username, password, role }, create) {
  username = username || 'johnuser'
  password = password || 'johnpass'
  role = role || 'user'

  if (create) {
    await User.create({ username, password, role })
  }

  const res = await request(app)
    .post('/auth/login')
    .send({ username, password })

  return res.body.token
}
