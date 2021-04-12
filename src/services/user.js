const ObjectId = require('mongoose').Types.ObjectId
const { NotFoundError, InvalidError, PolicyError } = require('../helpers')
const { User } = require('../models/user')

module.exports = {
  async create ({ username, password, role }, options) {
    const user = new User()

    if (options && options.policy && !options.policy(user)) {
      throw new PolicyError()
    }

    user.username = username
    user.password = password
    user.role = role

    await user.save()

    return {
      id: user.id,
      username: user.username,
      role: user.role
    }
  },

  async find ({ page, perPage }) {
    page = Number(page || 1)
    perPage = Number(perPage || 10)

    const users = await User
      .find()
      .limit(perPage)
      .skip((page - 1) * perPage)

    return users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role
    }))
  },

  async findById (id, options) {
    if (!ObjectId.isValid(id)) {
      throw new InvalidError()
    }

    const user = await User.findById(id)

    if (!user) {
      throw new NotFoundError()
    }

    if (options && options.policy && !options.policy(user)) {
      throw new PolicyError()
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    }
  },

  async updateById (id, { username, password, role }, options) {
    if (!ObjectId.isValid(id)) {
      throw new InvalidError()
    }

    const user = await User.findById(id)

    if (!user) {
      throw new NotFoundError()
    }

    if (options && options.policy && !options.policy(user)) {
      throw new PolicyError()
    }

    user.username = username
    user.password = password
    user.role = role

    await user.save()

    return {
      id: user.id,
      username: user.username,
      role: user.role
    }
  },

  async removeById (id, options) {
    if (!ObjectId.isValid(id)) {
      return null
    }

    const user = await User.findById(id)

    if (!user) {
      throw new NotFoundError()
    }

    const oldData = {
      id: user.id,
      username: user.username,
      role: user.role
    }

    await User.deleteOne({ _id: user.id })

    return oldData
  }
}
