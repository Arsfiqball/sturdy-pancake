const setupDB = require('./setup-db')
const login = require('./login')
const request = require('supertest')
const app = require('../src/app')
const { User } = require('../src/models/user')

setupDB({ suffixUrl: 'user' })

describe('User Endpoints', () => {
  it('should create a new valid user data', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${await login({ role: 'admin' }, true)}`)
      .send({
        username: 'johndoe',
        password: 'password@2020'
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('username', 'johndoe')
    expect(res.body).toHaveProperty('role', 'user')
    expect(res.body).not.toHaveProperty('password')

    const user = await User.findById(res.body.id)

    expect(user.username).toEqual(res.body.username)
    expect(user.id).toEqual(res.body.id)
    expect(user.role).toEqual(res.body.role)
  })

  it('should not accept a new user with invalid username', async () => {
    const usernames = ['%johndoe', '%john(doe', 'johndo e', 'johndoe-']
    const jwt = await login({ role: 'admin' }, true)

    for (const username of usernames) {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          username,
          password: 'password@2020'
        })

      const user = await User.findOne({ username })

      expect(res.statusCode).toEqual(422)
      expect(!user).toBe(true)
    }
  })

  it('should not accept a new user with invalid password', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${await login({ role: 'admin' }, true)}`)
      .send({
        username: 'johndoe',
        password: 'passwo' // too short
      })

    const user = await User.findOne({ username: 'johndoe' })

    expect(res.statusCode).toEqual(422)
    expect(!user).toBe(true)
  })

  it('should list all user data', async () => {
    const inserts = []

    const adminData = {
      username: 'johndoe0',
      password: 'password@0',
      role: 'admin'
    }

    inserts.push(adminData)
    await User.create(adminData)

    for (let i = 1; i < 8; i++) {
      const data = {
        username: `johndoe${i}`,
        password: `password@${i}`,
        role: 'user'
      }

      inserts.push(data)
      await User.create(data)
    }

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${await login(adminData)}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveLength(8)

    for (let i = 0; i < inserts.length; i++) {
      delete inserts[i].password
    }

    for (let i = 0; i < res.body.length; i++) {
      expect(inserts).toContainEqual({
        username: res.body[i].username,
        role: res.body[i].role
      })
    }
  })

  it('should list all user data per_page = 3, page = 2', async () => {
    const inserts = []

    const adminData = {
      username: 'johndoe0',
      password: 'password@0',
      role: 'admin'
    }

    inserts.push(adminData)
    await User.create(adminData)

    for (let i = 1; i < 8; i++) {
      const data = {
        username: `johndoe${i}`,
        password: `password@${i}`,
        role: 'user'
      }

      inserts.push(data)
      await User.create(data)
    }

    const res = await request(app)
      .get('/users?per_page=3&page=2')
      .set('Authorization', `Bearer ${await login(adminData)}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveLength(3)

    for (let i = 0; i < inserts.length; i++) {
      delete inserts[i].password
    }

    const fetches = []

    for (let i = 3; i <= 5; i++) {
      fetches.push(inserts[i])
    }

    for (let i = 0; i < res.body.length; i++) {
      expect(res.body[i]).toHaveProperty('id')
      expect(fetches).toContainEqual({
        username: res.body[i].username,
        role: res.body[i].role
      })
    }
  })

  it('should fetch a user data by ID', async () => {
    const data = {
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    }

    const user = await User.create(data)

    const res = await request(app)
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${await login(data)}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', user.id)
    expect(res.body).toHaveProperty('username', 'johndoe')
    expect(res.body).toHaveProperty('role', 'user')
    expect(res.body).not.toHaveProperty('password')
  })

  it('should not fetch user data by invalid or not existing ID', async () => {
    const jwt = await login({ role: 'user' }, true)

    const res = await request(app)
      .get('/users/lkwkjnf')
      .set('Authorization', `Bearer ${jwt}`)

    expect(res.statusCode).toEqual(400)

    const res2 = await request(app)
      .get('/users/551137c2f9e1fac808a5f572')
      .set('Authorization', `Bearer ${jwt}`)

    expect(res2.statusCode).toEqual(404)
  })

  it('should update valid user data', async () => {
    const data = {
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    }

    const user = await User.create(data)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${await login(data)}`)
      .send({
        username: 'doejohn',
        password: 'password@2021',
        role: 'user'
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', user.id)
    expect(res.body).toHaveProperty('username', 'doejohn')
    expect(res.body).toHaveProperty('role', 'user')
    expect(res.body).not.toHaveProperty('password')

    const userCheck = await User.findById(res.body.id)

    expect(userCheck.username).toEqual(res.body.username)
    expect(userCheck.id).toEqual(res.body.id)
    expect(userCheck.role).toEqual(res.body.role)
  })

  it('should not allow update role for regular user', async () => {
    const data = {
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    }

    const user = await User.create(data)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${await login(data)}`)
      .send({
        username: 'doejohn',
        password: 'password@2021',
        role: 'admin'
      })

    expect(res.statusCode).toEqual(403)

    const userCheck = await User.findById(user.id)

    expect(userCheck.role).toEqual('user')
  })

  it('should not update user data with invalid username', async () => {
    const data = {
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    }

    const user = await User.create(data)
    const jwt = await login(data)

    const usernames = ['%johndoe', '%john(doe', 'johndo e', 'johndoe-']

    for (const username of usernames) {
      const res = await request(app)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          username,
          password: 'password@2020'
        })

      expect(res.statusCode).toEqual(422)

      const userCheck = await User.findById(user.id)

      expect(userCheck.username).toEqual('johndoe')
      expect(userCheck.role).toEqual('user')
    }
  })

  it('should not update user data with invalid password', async () => {
    const data = {
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    }

    const user = await User.create(data)
    const jwt = await login(data)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        username: 'johndoe',
        password: 'passwo' // too short
      })

    expect(res.statusCode).toEqual(422)

    const userCheck = await User.findById(user.id)

    expect(userCheck.username).toEqual('johndoe')
    expect(userCheck.role).toEqual('user')
  })

  it('should remove user data', async () => {
    const user = await User.create({
      username: 'johndoe',
      password: 'password@2020',
      role: 'user'
    })

    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${await login({ role: 'admin' }, true)}`)

    const userCheck = await User.findById(user.id)

    expect(res.statusCode).toEqual(200)
    expect(!userCheck).toBe(true)
  })

  // it('should fetch a user data by current user', async () => {
  //   //
  // })
})
