const _ = require('lodash')
const path = require('path')
const Crypto = require('../utils/Crypto')
const {SYNC, ASYNC} = require('../config/constants')

class Secret {

  constructor(db) {
    this.db = db
  }

  init(options) {
    if (options.i) {
      return Promise.resolve(this.fromJSON(options))
    } else {
      this.key = Crypto.getRandomString(32, null, SYNC)
      this.salt = Crypto.getRandomString(12, null, SYNC)
      this.name = options.name
      this.tags = options.tags
      this.version = 0
      this.content = options.content
      return this.db.newId()
          .then(id => {
            return Promise.resolve(this.id = id)
          })
    }
  }

  load() {
    return this.getVersionedFilename()
        .then(key => this.db.get(key))
        .then(data => {
          if (data) {
            return this.getKey()
                .then(key => Crypto.fromAES(data, key))
                .then(content => {
                  this.fromContentJSON(content)
                  return Promise.resolve(true)
                })
          } else {
            return Promise.resolve(false)
          }
        })
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    this.id = json.i
    this.name = json.n
    this.key = Crypto.fromBase64(json.k, SYNC)
    this.salt = Crypto.fromBase64(json.s, SYNC)
    this.tags = json.t
    this.version = json.v
    this.content = {}
  }

  toFullJSON() {
    let s = this.toJSON()
    s.content = this.contentToJSON()
    return JSON.stringify(s)
  }

  toJSON(stringify) {
    const secret = {
      i: this.id,
      n: this.name,
      k: Crypto.toBase64(this.key, SYNC),
      s: Crypto.toBase64(this.salt, SYNC),
      t: this.tags,
      v: this.version
    }
    return stringify ? JSON.stringify(secret) : secret
  }

  onClose() {
    delete this.id
    delete this.name
    delete this.key
    delete this.salt
    this.content.onClose()
    delete this.content
  }

  update(options) {
    this.name = options.name
    this.tags = options.tags
    const fields = Secret.contentFields()
    const content = {}
    for (let f in fields) {
      if (options.content[fields[f]]) {
        if (this.content[f] !== options.content[fields[f]]) {
          content[f] = options.content[fields[f]]
          this.modified = true
        }
      } else if (this.content[f]) {
        this.modified = true
      }
    }
    if (this.modified) {
      this.version++
      this.content = content
    }
  }

  save() {
    // This saves only the content. The primary part is saved in the Manifest
    const content = JSON.stringify(this.contentToJSON())
    return this.getKey()
        .then(derivedKey => {
          return Promise.all([
            this.getVersionedFilename(),
            Crypto.toAES(content, derivedKey)
          ])
        })
        .then(([key, encryptedContent]) => {
          delete this.modified
          return this.db.put(key, encryptedContent)
        })
  }

  splitKey() {
    return [this.key.substring(0, 32), this.key.substring(32)]
  }

  getKey(mode = ASYNC) {
    const tempKey = this.key + Crypto.toSHA256(this.key + this.version, this.salt, null, SYNC)
    const key = Crypto.toSHA256(tempKey, this.salt, SYNC)
    if (mode === SYNC) {
      return key
    } else {
      return Promise.resolve(key)
    }
  }

  getVersionedFilename(mode = ASYNC) {
    const tempKey = Crypto.toSHA256(this.salt + this.version, this.key, null, SYNC) + this.key
    const filename = path.join(this.id, Crypto.toSHA256(tempKey, this.salt, 'base64', SYNC))
    if (mode === SYNC) {
      return filename
    } else {
      return Promise.resolve(filename)
    }
  }

  rename(name) {
    return Promise.resolve(this.name = name)
  }

  fromContentJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    const fields = _.invert(Secret.contentFields())
    const content = {}
    for (let f in fields) {
      content[f] = json[fields[f]]
    }
    this.content = content
  }

  contentToJSON(stringify) {
    const c = this.content
    const fields = Secret.contentFields()
    const content = {}
    for (let f in fields) {
      content[f] = c[fields[f]]
    }
    return stringify ? JSON.stringify(content) : content
  }

  static contentFields() {
    return {
      P: 'password',
      s: 'seed',
      k: 'privateKey',
      b: 'publicKey',
      C: 'cardData',
      e: 'email', // ['s@ss.co]
      N: 'notes',
      p: 'pin',
      u: 'url',
      f: 'fileName',
      l: 'lastUpdateAt'
    }
  }

}

module.exports = Secret