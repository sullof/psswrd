'use strict'

/* globals Promise */

const path = require('path')
const assert = require('assert')
function rRequire (m) {
  return require(path.resolve(process.cwd(), m))
}

const fs = rRequire('./lib/utils/fs')
const { SYNC } = rRequire('./lib/config/constants')
const Secret = rRequire('./lib/models/Secret')
const Db = rRequire('./lib/utils/Db')
const Crypto = rRequire('./lib/utils/Crypto')

describe('Secret', function () {

  let dbDir = path.resolve(__dirname, '../../../tmp/.secret')
  let db = new Db

  let secret

  let options = {
    name: 'MyBank',
    content: {
      email: 'you@example.com',
      password: '8su3^%h2lK'
    }
  }

  before(function () {
    db.init(dbDir, SYNC)
  })

  after(function () {
    return fs.emptyDirAsync(dbDir)
  })

  it('should construct a Secret instance', () => {
    secret = new Secret(db)
    return secret.init(options)
        .then(() => {
          assert(secret.content.email === options.content.email)
          assert(secret.id)
          assert(secret.key)
          assert(secret.salt)
        })
  })

  it('should instantiate an existent secret', () => {

    // console.log(secret)

    const json = {
      n: options.name,
      i: secret.id,
      k: Crypto.toBase64(secret.key, SYNC),
      s: Crypto.toBase64(secret.salt, SYNC),
      v: secret.version
    }

    secret = new Secret(db)
    return secret.init(json)
        .then(s => {

          // console.log(secret)

          assert(secret.id === json.i)
          assert(Crypto.toBase64(secret.key, SYNC) === json.k)
          assert(Crypto.toBase64(secret.salt, SYNC) === json.s)
        })
  })


  it('should update the secret', () => {

    return Promise.resolve(secret.update(options))
        .then(() => {

          // console.log(secret)

          assert(secret.version === 1)
        })
  })

  it('should save the secret content', () => {
    return secret.save()
        .then(s => {
          assert(fs.existsSync(path.join(dbDir, secret.getVersionedFilename(SYNC))))
          //
          // console.log(JSON.stringify(secret))
          // assert(secret.id)
        })
  })

  it('should load the saved secret content', () => {
    secret.content = {}
    return secret.load()
        .then(s => {
          assert(secret.content.email === options.email)
        })
  })


  it('should empty the secret onClose', () => {
    secret.onClose()
    assert(secret.id === undefined)
  })




})
