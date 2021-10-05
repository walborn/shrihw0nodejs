const request = require('supertest')
const app = require('./src/server')
const Image = require('./src/image')
const database = require('./src/database')

const fs = require('fs')

const { Dump, Images } = require('./src/config')

afterEach(() => fs.promises.access(Dump, fs.constants.F_OK)
  .then(() => fs.promises.unlink(Dump))
  .catch(() => false)
)

afterEach(() => fs.promises.readdir(Images)
  .then(files => Promise.all(files
    .filter(file => file.endsWith('.jpeg'))
    .map(file => fs.promises.unlink(`${Images}/${file}`))
  ))
)


test('GET /list', async () => {

  const image = new Image()
  const body = await fs.promises.readFile('./example/avatar.jpg')
  await database.insert(image, body)

  await request(app)
    .get('/list')
    .expect(200)
    .then((response) => {
      // Check type and length
      const images = response.body
      expect(Array.isArray(images)).toBeTruthy()
      expect(images.length).toEqual(1)

      // Check data
      const { id, size, createdAt } = images[0]
      expect(id).toBe(image.id)
      expect(size).toEqual(image.size)
      expect(createdAt).toBe(image.createdAt)
    })
})

test('GET /image/:id', async () => {
  const image = new Image()
  const body = await fs.promises.readFile('./example/avatar.jpg')
  await database.insert(image, body)

  await request(app)
    .get(`/image/${image.id}`)
    .expect(200)
})
