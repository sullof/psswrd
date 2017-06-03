const path = require('path')
const fs = require('./fs')
const Crypto = require('./Crypto')

class Db {

  init(dir) {
    this.dir = dir
    return fs.ensureDirAsync(dir)
  }

  file(key) {
    return Crypto.toBase64(key)
        .then(key => Promise.resolve(path.join(this.dir, key)))
  }

  get(key) {
    return this.file(key)
        .then(file => {
          if (fs.existsSync(file)) {
            return fs.readFileAsync(file, 'utf-8')
          } else {
            return null
          }
    })
  }

  put(key, value) {
    return this.file(key)
        .then(file => {
          return fs.writeFileAsync(file, value)
        })
  }

}

module.exports = new Db