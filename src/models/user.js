const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    maxLength: 24,
    trim: true,
    match: /^[a-zA-Z]+[a-zA-Z0-9_]*$/
  },
  password: {
    type: String,
    required: true,
    minLength: 7
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR)
  } catch (err) {
    next(err)
  }
})

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

const User = model('User', UserSchema)

module.exports = { User, UserSchema }
