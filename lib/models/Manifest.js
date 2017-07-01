const Crypto = require('../utils/Crypto')
const Secret = require('./Secret')
const {errors, keys} = require('../config/constants')

class Manifest {

  constructor(db) {
    this.db = db
    this.lastId = 0
    this.lastUpdateAt = Date.now()
    this.secrets = {}
    this.history = []
  }

  init(masterKey) {
    this.masterKey = masterKey
    return this.db.get(keys.MANIFEST)
        .then(encryptedManifest => {
          if (encryptedManifest) {
            return Crypto.fromAES(encryptedManifest, masterKey)
          } else {
            const data = this.toJSON(true)
            return Crypto.toAES(data, masterKey)
                .then(encryptedManifest => this.db.put(keys.MANIFEST, encryptedManifest))
                .then(() => Promise.resolve(data))
          }
        })
        .then(json => {
          this.fromJSON(json)
          return Promise.resolve()
        })
  }

  onClose() {
    delete this.masterKey
    for (let secret in this.secrets) {
      secret.onClose()
    }
    delete this.data
    delete this.history
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    this.lastId = json.i
    this.lastUpdate = json.u
    if (Array.isArray(json.s)) {
      for (let secret of json.s) {
        this.secrets[secret.i] = new Secret(this.db, secret)
      }
    }
  }

  toJSON(stringify) {
    const data = {
      i: this.lastId,
      u: Date.now(),
      s: []
    }
    for (let secret in this.secrets) {
      data.s.push(secret.toJSON())
    }
    return stringify ? JSON.stringify(data) : data
  }

  save(lastSecret) {
    let promises = [lastSecret]
    for (let secret in this.secrets) {
      if (secret.modified) {
        promises.push(secret.save())
      }
    }
    return Promise.all(promises)
  }

  setSecret(options) {
    let secret
    if (options.id) {
      secret = this.secrets[options.id]
      if (!secret) {
        return Promise.reject(errors.SecretNotFound)
      }
    } else {
      secret = new Secret(this.db, options)
      console.log(secret.toJSON(true))
    }
    secret.update(options)
    this.secrets[secret.i] = secret
    return this.save(secret)
  }
}

module.exports = Manifest