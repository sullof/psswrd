const path = require('path')
const {errors, keys} = require('../config/constants')

class Content extends require('./Model') {

  constructor(db, id, key) {
    super(db)
    this.id = id
    this.key = key
  }

  load() {
    return db.get(path.join(this.id, keys.CONTENT))
        .then(text => {
          if (text) {
            return Crypto.fromAES(text, this.key)
                .then(content => {
                  this.content = this.fromJSON(content)
                  return Promise.resolve()
                })
          } else {
            return Promise.resolve()
          }
        })
  }

  onClose() {
    this.id = null
    this.key = null
    this.content = null
  }

  saveContent() {


    if (this.modified) {

    }
  }

  fromJSON(content) {
    if (typeof content === 'string') {
      content = JSON.parse(content)
    }
    return {
      password: content.P,
      seed: content.s,
      privateKey: content.k,
      publicKey: content.b,
      cardData: content.C,
      emails: content.e,
      notes: content.N,
      pin: content.p,
      url: content.u,
      fileName: content.f,
      lastUpdateAt: content.l
    }
  }

  toJSON() {
    const c = this.content
    const content = {
      P: c.password,
      s: c.seed,
      k: c.privateKey,
      b: c.publicKey,
      C: c.cardData,
      e: c.emails,
      N: c.notes,
      p: c.pin,
      u: c.url,
      f: c.fileName,
      l: c.lastUpdateAt
    }
    return JSON.stringify(content)
  }

}

module.exports = Content