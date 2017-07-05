'use strict'

/* globals Promise */

const assert = require('assert')
const path = require('path')

function rRequire (m) {
  return require(path.resolve(process.cwd(), m))
}

const Crypto = rRequire('./lib/utils/Crypto')

describe('Crypto', function () {

  let plainStr = 'sometimes it rains'
  let base64Str = 'c29tZXRpbWVzIGl0IHJhaW5z'
  let salt = 'a bit of salt'
  let hash = 'e3f00e5e69e23dfbaf2f1079fa48d65eed8989fe69c1fce67dee54e72badbed3'
  let password = 'a very yellow trip on a ferryboat in alaska'
  let encryptedStr = 'hEkTA4f7BMFpkWXcCcBdDS4jE8PqaFpwog6mhQZF8FU='
  let uuid = '4681b508-a3fb-4e60-99c2-22918ece252c'

  it('should encode a string to base64', () => {
    return Crypto.toBase64(plainStr)
        .then(b64 => {
          assert(b64 === base64Str)
        })
  })

  it('should decode a base64 string', () => {
    return Crypto.fromBase64(base64Str)
        .then(str => {
          assert(str === plainStr)
        })
  })

  it('should return a sha256 of a string', () => {
    return Crypto.toSHA256(plainStr, salt, 'hex')
        .then(hash256 => {
          assert(hash256 === hash)
        })
  })

  it('should encode a string to AES 256', () => {
    return Crypto.toAES(plainStr, password)
        .then(encrypted => {
          assert(encrypted === encryptedStr)
        })
  })

  it('should decode a string encrypted with AES 256', () => {
    return Crypto.fromAES(encryptedStr, password)
        .then(decrypted => {
          assert(decrypted === plainStr)
        })
  })

  it('should validate an uuid', () => {
    return Promise.resolve(Crypto.isUuid(uuid))
        .then(is => {
          assert(is)
        })
  })

  it('should generate a new uuid', () => {
    return Promise.resolve(Crypto.getNewId())
        .then(newId => {
          assert(Crypto.isUuid(newId))
        })
  })


})