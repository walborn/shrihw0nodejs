const path = require('path')

const Store = path.resolve(__dirname, '../store/')
const Dump = path.resolve(Store, 'dump.json')
const Images = path.resolve(Store, 'images')

module.exports = {
  PORT: 8080,
  Store,
  Dump,
  Images,
}
