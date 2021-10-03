const express = require('express')
const { PORT, Images } = require('./config')
const database = require('./database')
const Image = require('./image')


const app = express()

app.use(express.json())

app.use('/files', express.static(Images))

app.get('/list', (req, res) => res.json({ images: database.find().map(image => image.toJSON()) }))

app.get('/image/:id', (req, res) => res.json(database.findOne(req.params.id).toJSON()))

app.delete('/image/:id', async (req, res) => {
  const id = await database.remove(req.params.id)
  return res.json({ id })
})

app.post('/upload', async (req, res) => {
  let body = ''
  req
    .on('data', raw => body += raw.toString('binary'))
    .on('end', async () => {
      // removing header and footer (`${header}\r\n\r\n` and `\r\n--${boundary}--\r\n`)
      const headerCorrection = body.indexOf('\r\n\r\n') + 4
      const contentType = req.headers['content-type']
      const boundaryStartsWith = 'multipart/form-data; boundary='.length
      const boundaryCorrection = contentType.length - boundaryStartsWith + 8
      body = body.slice(headerCorrection, -boundaryCorrection)

      const image = new Image()
      await database.insert(image, body)
      return res.json(image.toJSON())
    })
})

app.get('/merge', async (req, res) => {
  const f = database.findOne(req.query.front).size
  const b = database.findOne(req.query.back).size

  if (f.width !== b.width || f.height !== b.height)
    return res.status(400).json({ message: 'Bad Request' })

  const readableStream = await database.merge(req.query)
  readableStream.pipe(res)
})


app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
