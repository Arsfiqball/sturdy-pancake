const express = require('express')
const { bearerJWT } = require('./middlewares/auth')
const { errorHandler } = require('./middlewares/utils')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(bearerJWT)
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/user'))
app.use(errorHandler) // should be defined last

module.exports = app
