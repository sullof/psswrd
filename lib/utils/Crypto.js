const crypto = require('crypto')
const uuidV4 = require('uuid').v4
const {SYNC, ASYNC} = require('../config/constants')

class Crypto {

  static isUuid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)
  }

  static toBase64(data, mode = ASYNC) {
    const str = new Buffer(data).toString('base64')
    if (mode === SYNC) {
      return str
    }
    else {
      return Promise.resolve(str)
    }
  }

  static fromBase64(data, mode = ASYNC) {
    const str = new Buffer(data, 'base64').toString('utf-8')
    if (mode === SYNC) {
      return str
    }
    else {
      return Promise.resolve(str)
    }
  }

  static fromAES(encrypted, password, bit = 256, mode = ASYNC) {
    const decipher = crypto.createDecipher('aes' + bit, password)
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    if (mode === SYNC) {
      return decrypted
    } else {
      return new Promise(resolve => {
        resolve(decrypted)
      })
    }
  }

  static toAES(data, password, bit = 256, mode = ASYNC) {
    const cipher = crypto.createCipher('aes' + bit, password)
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    if (mode === SYNC) {
      return encrypted
    } else {
      return new Promise(resolve => {
        resolve(encrypted)
      })
    }
  }

  static toSHA256(data, salt, encode, mode = ASYNC) {
    const encStr = crypto.createHmac('sha256', salt || '').update(data).digest(encode)
    if (mode === SYNC) {
      return encStr
    } else {
      return new Promise(resolve => {
        resolve(encStr)
      })
    }
  }

  static getRandomString(length, encode, mode = ASYNC) {
    if (mode === SYNC) {
      const buf = crypto.randomBytes(length)
      return buf.toString(encode)
    } else {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buf) => {
          if (err) reject(err)
          else resolve(buf.toString(encode))
        })
      })
    }
  }

  static getDerivedKey(key, salt, encode, mode = ASYNC) {
    return Crypto.toSHA256(key, salt, encode, mode = ASYNC)
  }

  static getNewId() {
    return uuidV4();
  }

}

module.exports = Crypto