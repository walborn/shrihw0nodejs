const express = require('express')
const fs = require('fs')
const multer  = require('multer')

const { Images } = require('./config')
const database = require('./database')
const Image = require('./image')


const app = express()

app.use(express.json())

app.use('/files', express.static(Images))

app.get('/list', (req, res) => res.json(database.find().map(image => image.toJSON())))

app.get('/image/:id', (req, res) => {
  const file = database.findOne(req.params.id)
	fs.createReadStream(`${Images}/${file.id}.jpeg`).pipe(res)
})

app.delete('/image/:id', async (req, res) => {
  const id = await database.remove(req.params.id)
  return res.json({ id })
})

const upload = multer({ storage: multer.memoryStorage() })

app.post('/upload', upload.single('value'), async (req, res) => {
  const image = new Image()
  await database.insert(image, req.file.buffer)
  return res.json(image.toJSON())
})

app.get('/merge', async (req, res) => {
  const front = database.findOne(req.query.front).size
  const back = database.findOne(req.query.back).size

  if (front.width !== back.width || front.height !== back.height)
    return res.status(400).json({ message: 'Bad Request' })

  const readableStream = await database.merge(req.query)
  readableStream.pipe(res)
})

module.exports = app
