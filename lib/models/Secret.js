const Crypto = require('../utils/Crypto')
const {errors} = require('../config/constants')

class Secret extends require('./Model') {

  constructor(db, json) {
    super(db)
    if (json.key) {
      this.fromJSON(json)
    } else {
      this.key = Crypto.getRandomString(32)
      this.name = json.name
      this.tags = json.t
      this.version = 0
    }
  }

  splitKey() {
    return [this.key.substring(0, 16), this.key.substring(16)]
  }

  getKey() {
    const [key, salt] = this.splitKey()
    return Crypto.toSHA256(key + this.version, salt)
  }

  getContentKey() {
    const [key, salt] = this.splitKey()
    Promise.all([
      Crypto.toSHA256(salt + key, key + salt, 'base64'),
      Crypto.toSHA256(salt + this.version, key, 'base64')
    ])
        .then(([directory, filename]) => path.join(directory, filename))
  }

  load() {
    return this.getContentKey()
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

  save() {
    const content = JSON.stringify(this.toJSON())
    this.version++
    return this.getKey()
        .then(derivedKey => {
          return Promise.all([
            this.getContentKey(),
            Crypto.toAES(content, derivedKey)
          ])
        })
        .then(([key, encryptedContent]) => this.db.put(key, encryptedContent))
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    this.id = json.i
    this.name = json.n
    this.key = Crypto.fromBase64(json.k)
    this.tags = json.t
    this.version = json.v
  }

  toJSON(stringify) {
    const secret = {
      i: this.id,
      n: this.name,
      k: Crypto.toBase64(this.key),
      t: this.tags,
      v: this.version
    }
    return stringify ? JSON.stringify(secret) : secret
  }

  onClose() {
    delete this.id
    delete this.name
    delete this.key
    this.content.onClose()
    delete this.content
  }

  set(json) {
    const fields = this._.invert(Secret.contentFields())
    const content = {}
    for (let f in fields) {
      content[f] = json[fields[f]]
    }
    this.content = content
  }

  rename(name) {
    return Promise.resolve(this.name = name)
  }

  fromContentJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    const fields = this._.invert(Secret.contentFields())
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
      e: 'emails',
      N: 'notes',
      p: 'pin',
      u: 'url',
      f: 'fileName',
      l: 'lastUpdateAt'
    }
  }

}

module.exports = Secret