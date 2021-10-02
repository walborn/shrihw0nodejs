const { EventEmitter } = require('events')
const { existsSync, createReadStream } = require('fs')
const { writeFile } = require('fs/promises')
const { replaceBackground } = require('backrem')

const { Dump, Images } = require('./config')
const Image = require('./image')


class Database extends EventEmitter {
  constructor() {
    super()
    this.images = {}
  }

  async initFromDump() {
    if (!existsSync(Dump)) return

    const dump = require(Dump)

    if (typeof dump.images === 'object') {
      this.images = {}

      for (let id in dump.images) {
        const image = dump.images[id]
        this.images[id] = new Image(image.id, image.createdAt)
      }
    }
  }

  async insert(image, content) {
    await image.save(content)

    this.images[image.id] = image

    this.emit('changed')
  }

  async remove(id) {
    const raw = this.images[id]
    const image = new Image(raw.id, raw.createdAt)

    await image.remove()

    delete this.images[id]

    this.emit('changed')

    return id
  }

  async merge({ front, back, color, threshold }) {
    const Front = createReadStream(`${Images}/${front}.jpeg`)
    const Back = createReadStream(`${Images}/${back}.jpeg`)

    return replaceBackground(Front, Back, color.split(','), threshold)
  }

  findOne(id) {
    const raw = this.images[id]
    if (!raw) return null
    return new Image(raw.id, raw.createdAt)
  }

  find() {
    return Object.values(this.images)
  }

  toJSON() {
    return {
      images: this.images,
    }
  }
}

const database = new Database()

database.initFromDump()

database.on('changed', () => {
  writeFile(Dump, JSON.stringify(database.toJSON(), null, 2))
})

module.exports = database
