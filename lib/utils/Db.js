const path = require('path')
const fs = require('./fs')
const {keys} = require('../config/constants')

class Db {

  init(dir) {
    this.dir = dir
    return fs.ensureDirAsync(dir)
  }

  file(key) {
    if (keys[key]) {
      key = '.' + key
    }
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
    return fs.ensureDir(path.dirname(file))
        .then(() => {
          return fs.writeFileAsync(file, value)
        })
  }

}

module.exports = new Db