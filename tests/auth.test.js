const setupDB = require('./setup-db')
const request = require('supertest')
const app = require('../src/app')
const { User } = require('../src/models/user')

setupDB({ suffixUrl: 'auth' })

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Auth Endpoints', () => {
  it('should authenticate and generate token', async () => {
    const user = await User.create({
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    })

    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'johndoe',
        password: 'password@2020'
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('id', user.id)
    expect(res.body.user).toHaveProperty('username', 'johndoe')
    expect(res.body.user).toHaveProperty('role', 'user')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('should not authenticate with wrong username', async () => {
    await User.create({
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    })

    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'johnoel',
        password: 'password@2020'
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body).not.toHaveProperty('user')
  })

  it('should not authenticate with wrong password', async () => {
    await User.create({
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    })

    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'johndoe',
        password: 'password@2021'
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body).not.toHaveProperty('user')
  })

  it('should refresh new token', async () => {
    await User.create({
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    })

    let res = await request(app)
      .post('/auth/login')
      .send({
        username: 'johndoe',
        password: 'password@2020'
      })

    const oldToken = res.body.token

    await sleep(1000)

    res = await request(app)
      .get('/auth/refresh')
      .set('Authorization', `Bearer ${oldToken}`)

    expect(res.body).toHaveProperty('token')
    expect(res.body.token).not.toEqual(oldToken)
  })
})
