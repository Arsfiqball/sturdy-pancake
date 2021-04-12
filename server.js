require('dotenv').config()

const assert = require('assert')
const mongoose = require('mongoose')
const app = require('./src/app')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 1337

assert.ok(!!process.env.MONGO_URL, 'MONGO_URL is required!')

mongoose.promise = global.Promise
mongoose.set('useCreateIndex', true)

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.listen(port, host, () => {
  console.log(`[server] Running on ${host}:${port}`)
})
