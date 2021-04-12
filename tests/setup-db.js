const mongoose = require('mongoose')

mongoose.promise = global.Promise
mongoose.set('useCreateIndex', true)

async function removeAllCollections () {
  const collections = Object.keys(mongoose.connection.collections)

  for (const name of collections) {
    const collection = mongoose.connection.collections[name]
    await collection.deleteMany()
  }
}

async function dropAllCollections () {
  const collections = Object.keys(mongoose.connection.collections)

  for (const name of collections) {
    const collection = mongoose.connection.collections[name]

    try {
      await collection.drop()
    } catch (error) {
      if (error.message === 'ns not found') return
      if (error.message.includes('a background operation is currently running')) return
      console.error(error.message)
    }
  }
}

module.exports = function ({ suffixUrl }) {
  beforeAll(async () => {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/sejutacita-test-x'

    await mongoose.connect(mongoUrl + (suffixUrl || ''), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  })

  afterEach(async () => {
    await removeAllCollections()
  })

  afterAll(async () => {
    await dropAllCollections()
    await mongoose.connection.close()
  })
}
