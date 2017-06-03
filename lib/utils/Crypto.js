const crypto = require('crypto')

class Crypto {

  static toBase64(data) {
    return Promise.resolve(new Buffer(data).toString('base64'))
  }

  static fromBase64(data) {
    return Promise.resolve(new Buffer(data, 'base64').toString('utf-8'))
  }

  static fromAES(encrypted, password, bit = 256) {
    return new Promise(resolve => {
      const decipher = crypto.createDecipher('aes' + bit, password)
      let decrypted = decipher.update(encrypted, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      resolve(decrypted)
    })
  }

  static toAES(data, password, bit = 256) {
    return new Promise(resolve => {
      const cipher = crypto.createCipher('aes' + bit, password)
      let encrypted = cipher.update(data, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      resolve(encrypted)
    })
  }

  static fromAES256(encrypted, password) {
    return Crypto.fromAES(encrypted, password, 256)
  }

  static toAES256(encrypted, password) {
    return Crypto.toAES(encrypted, password, 256)
  }

  static toSHA256(data, salt = '') {
    return new Promise(resolve => {
      resolve(
          crypto.createHmac('sha256', salt)
              .update(data)
              .digest('hex')
      )
    })
  }

  static getRandomString(length, encode) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, buf) => {
        if (err) reject(err)
        else resolve(buf.toString(encode))
      })
    })
  }

}

module.exports = Crypto