const path = require('path')
const fs = require('./fs')
const Crypto = require('./Crypto')
const {keys} = require('../config/constants')

class Db {

  init(dir) {
    this.dir = dir
    return fs.ensureDirAsync(dir)
  }

  file(key) {
    return path.join(this.dir, key)
  }

  get(key) {
    const file = this.file(key)
    if (fs.existsSync(file)) {
      return fs.readFileAsync(file, 'utf-8')
    } else {
      return Promise.resolve()
    }
  }

  put(key, value) {
    const file = this.file(key)
    return fs.ensureDirAsync(path.dirname(file))
        .then(() => {
          return fs.writeFileAsync(file, value)
        })
  }

  newId() {
    return Crypto.getRandomString(8, 'base64')
        .then(id => {
          id = id.replace(/\//g,'')
          if (fs.existsSync(this.get(id))) {
            return this.newId()
          } else {
            return Promise.resolve(id)
          }
        })
  }

}

module.exports = new Db