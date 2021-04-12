const jwt = require('jsonwebtoken')
const { User } = require('../models/user')

const secretKey = process.env.SECRET_KEY || ('qwerty+' + Date.now())

module.exports = {
  async attempt ({ username, password }) {
    const user = await User.findOne({ username })

    if (!user) {
      return null
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    }
  },

  createJWT ({ id }) {
    return new Promise((resolve, reject) => {
      jwt.sign({ sub: id }, secretKey, { expiresIn: '7d' }, (err, token) => {
        if (err) return reject(err)
        resolve(token)
      })
    })
  },

  verifyJWT (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, payload) => {
        if (err) return reject(err)
        resolve(payload)
      })
    })
  }
}
