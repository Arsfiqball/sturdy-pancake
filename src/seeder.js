const { User } = require('./models/user')

module.exports = async function () {
  const existingUser = await User.findOne({ role: 'admin' })

  if (!existingUser) {
    await User.create({
      username: 'admin',
      password: 'admin@123',
      role: 'admin'
    })
  }
}
