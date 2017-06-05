const crypto = require('crypto')
const uuidV4 = require('uuid').v4

class Crypto {

  static isUuid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)
  }

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

  static toSHA256(data, salt, encode) {
    return new Promise(resolve => {
      resolve(
          crypto.createHmac('sha256', salt || '').update(data).digest(encode)
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

  static getDerivedKey(key, salt, encode) {
    return Crypto.toSHA256(key, salt, encode)
  }

  static getNewId() {
    return uuidV4();
  }

}

module.exports = Crypto