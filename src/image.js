const path = require('path')
const { nanoid } = require('nanoid')
const { writeFile, unlink } = require('fs/promises')

const { Images } = require('./config')

module.exports = class Image {
  constructor(id = nanoid(), createdAt = Date.now()) {
    this.id = id
    this.createdAt = createdAt
    this.fileName = `${this.id}.jpeg`
  }

  async save(content) {
    await writeFile(path.resolve(Images, this.fileName), content, 'binary')
  }

  async remove() {
    await unlink(path.resolve(Images, this.fileName))
  }

  toJSON() {
    return {
      id: this.id,
      url: `/files/${this.id}.jpeg`,
      createdAt: this.createdAt,
    }
  }
}
