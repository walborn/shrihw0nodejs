const path = require('path')
const { nanoid } = require('nanoid')
const { writeFile, unlink } = require('fs/promises')
const sizeOf = require('image-size')

const { Images } = require('./config')

module.exports = class Image {
  constructor(id = nanoid(), createdAt = Date.now(), size = {}) {
    this.id = id
    this.createdAt = createdAt
    this.fileName = `${this.id}.jpeg`
    this.size = size
  }

  async save(content) {
    await writeFile(path.resolve(Images, this.fileName), content, 'binary')
    this.size = sizeOf(path.resolve(Images, this.fileName))
  }

  async remove() {
    await unlink(path.resolve(Images, this.fileName))
  }

  toJSON() {
    return {
      id: this.id,
      url: `/files/${this.id}.jpeg`,
      size: this.size,
      createdAt: this.createdAt,
    }
  }
}
