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
  const contentType = req.headers['content-type']
  const boundaryStartsWith = 'multipart/form-data; boundary='.length
  // `\r\n--${boundary}--\r\n`
  const boundaryCorrection = contentType.length - boundaryStartsWith + 8
  
  req.on('data', raw => body += raw.toString('binary'))

  req.on('end', async () => {
    // removing header and footer
    // `${header}\r\n\r\n` and `\r\n--${boundary}--\r\n`
    const headerCorrection = body.indexOf('\r\n\r\n') + 4
    body = body.slice(headerCorrection, -boundaryCorrection)

    const image = new Image()
    await database.insert(image, body)
    return res.json(image.toJSON())
  })
})

// 200, 50, 52
//merge?front=<id>&back=<id>&color=145,54,32&threshold=5`
app.get('/merge', async (req, res) => {
  const readableStream = await database.merge(req.query)
  readableStream.pipe(res)
})


// app.post('/upload', async (req, res) => {
//   let body = ''
//   var header = ''
//   var boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
//   var headerFlag = true

//   req.on('data', function(raw) {
//     console.log('received data length: ' + raw.length);
//     var i = 0;
//     while (i < raw.length)
//       if (headerFlag) {
//         var chars = raw.slice(i, i+4).toString();
//         if (chars === '\r\n\r\n') {
//           headerFlag = false;
//           header = raw.slice(0, i+4).toString();
//           i = i + 4;
//         }
//         else {
//           i += 1;
//         }
//       }
//       else { 
//         // parsing body including footer
//         body += raw.toString('binary', i, raw.length);
//         i = raw.length;
//         console.log('actual file size: ' + body.length);
//       }
//   });

//   req.on('end', async () => {
//     // removing footer '\r\n'--boundary--\r\n' = (boundary.length + 8)
//     body = body.slice(0, body.length - (boundary.length + 8))
//     const image = new Image()
//     await database.insert(image, body)
//     return res.json(image.toJSON())
//   })
// })


// .post('/api/v1/uploads', function (req, res) {
//   var busboy = new Busboy({headers: req.headers});
//   console.log(req.headers);
//   busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
//       file.on('data', function (data) {
//           console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
//       });
//       file.on('end', function () {
//           console.log('File [' + fieldname + '] Finished');
//       });
//       var saveTo = path.join(__dirname, 'dir', path.basename(filename));
//       var outStream = fs.createWriteStream(saveTo);
//       file.pipe(outStream);
//   });
//   busboy.on('finish', function () {
//       res.writeHead(HttpStatus.OK, {'Connection': 'close'});
//       res.end("That's all folks!");
//   });
//   return req.pipe(busboy);
// })

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
