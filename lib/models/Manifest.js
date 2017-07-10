const _ = require('lodash')
const Crypto = require('../utils/Crypto')
const Secret = require('./Secret')
const minimatch = require('minimatch')
const {errors, keys, SYNC, ASYNC} = require('../config/constants')

class Manifest {

  constructor(db) {
    this.db = db
    this.createdAt = Crypto.timestamp()
    this.secrets = {}
    // this.history = []
    this.extraFields = {
      // z: 'customField' << the key is generated to avoid conflicts
    }
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
    this.createdAt = json.c
    if (json.u) {
      this.updatedAt = json.u
    }
    this.extraFields = json.X
    if (Array.isArray(json.s)) {
      for (let s of json.s) {
        this.secrets[s.i] = new Secret(this.db)
        this.secrets[s.i].init(s, SYNC)
      }
    }
  }

  toJSON(stringify) {
    const data = {
      u: Date.now(),
      c: this.createdAt,
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
    let promises = []
    if (secret.modified) {
      promises.push(secret.save())
      promises.push(this.save())
    }
    return Promise.all(promises)
  }

  ls(filter, mode = ASYNC) {
    let list = {}
    for (let id in this.secrets) {
      let secret = this.secrets[id]
      if (!filter || minimatch(secret.name, filter)) {
        list[id] = _.pick(secret, ['name', 'createdAt', 'updatedAt'])
      }
    }
    if (mode === SYNC) {
      return list
    } else {
      return Promise.resolve(list)
    }
  }

}

module.exports = Manifest