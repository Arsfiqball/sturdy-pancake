require('dotenv').config()

const assert = require('assert')
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yml')
const app = require('./src/app')
const seeder = require('./src/seeder')

assert.ok(!!process.env.MONGO_URL, 'MONGO_URL is required!')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 1337
const mongoUrl = process.env.MONGO_URL

async function run () {
  mongoose.promise = global.Promise
  mongoose.set('useCreateIndex', true)

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  await seeder()

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.listen(port, host, () => {
    console.log(`[server] Running on ${host}:${port}`)
  })
}

run().catch(console.error)
