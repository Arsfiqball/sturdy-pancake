const express = require('express')
const { bearerJWT } = require('./middlewares/auth')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(bearerJWT)
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/user'))

module.exports = app
