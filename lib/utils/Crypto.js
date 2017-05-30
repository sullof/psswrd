const crypto = require('crypto')

class Crypto {

  static toBase64(data) {
    return Promise.resolve(new Buffer(data).toString('base64'))
  }

  static fromBase64(data) {
    return Promise.resolve(new Buffer(data, 'base64').toString('utf-8'))
  }

  static fromAES(encrypted, password, bit = 256) {
    return Promise.resolve()
        .then(() => {
          const decipher = crypto.createDecipher('aes' + bit, password)
          let decrypted = decipher.update(encrypted, 'base64', 'utf8')
          decrypted += decipher.final('utf8')
          return Promise.resolve(JSON.parse(decrypted))
        })
  }

  static toAES(data, password, bit = 256) {
    return Promise.resolve()
        .then(() => {
          const cipher = crypto.createCipher('aes' + bit, password)
          let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64')
          encrypted += cipher.final('base64')
          return Promise.resolve(encrypted)
        })
  }


}

module.exports = Crypto