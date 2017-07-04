const Crypto = require('../utils/Crypto')
const Secret = require('./Secret')
const {errors, keys, SYNC} = require('../config/constants')

class Manifest {

  constructor(db) {
    this.db = db
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
            return this.save()
          }
        })
        .then(json => {
          this.fromJSON(json)
          return Promise.resolve()
        })
  }

  onClose() {
    delete this.masterKey
    for (let id in this.secrets) {
      this.secrets[id].onClose()
    }
    delete this.secrets
    delete this.history
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    this.lastUpdate = json.u
    if (Array.isArray(json.s)) {
      for (let secret of json.s) {
        this.secrets[secret.i] = new Secret(this.db)
        this.secrets[secret.i].init(SYNC)

      }
    }
  }

  toJSON(stringify) {
    const data = {
      u: Date.now(),
      s: []
    }
    for (let id in this.secrets) {
      let secret = this.secrets[id]
      data.s.push(secret.toJSON())
    }
    return stringify ? JSON.stringify(data) : data
  }

  save() {
    const data = this.toJSON(true)
    return Crypto.toAES(data, this.masterKey)
        .then(encryptedManifest => {
          return this.db.put(keys.MANIFEST, encryptedManifest)
        })
        .then(() => Promise.resolve(data))
        .catch(console.error)
  }

  setSecret(options) {
    let secret
    if (options.id) {
      secret = this.secrets[options.id]
      if (!secret) {
        return Promise.reject(errors.SecretNotFound)
      }
      secret.update(options)
    } else {
      secret = new Secret(this.db)
      secret.init(options, SYNC)
    }
    this.secrets[secret.id] = secret
    let promises = [secret]
    for (let id in this.secrets) {
      let secret = this.secrets[id]
      if (secret.modified) {
        promises.push(secret.save())
      }
    }
    promises.push(this.save())
    return Promise.all(promises)
  }
}

module.exports = Manifest