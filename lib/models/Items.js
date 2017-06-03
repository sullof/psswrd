const Item = require('./Item')
const Crypto = require('../utils/Crypto')

class Items {

  constructor(db) {
    this.db = db
    this.data = {
      items: []
    }
    this.history = []
  }

  init(masterKey) {
    this.masterKey = masterKey
    this.db.get('items')
        .then(encryptedIndex => {
          if (encryptedIndex) {
            return Crypto.fromAES(encryptedIndex, masterKey)
          } else {
            const data = this.toJSON()
            return Crypto.toAES(data, masterKey)
                .then(encryptedIndex => this.db.put('items', encryptedIndex))
                .then(() => Promise.resolve(data))
          }
        })
        .then(index => {
          this.fromJSON(index)
          return Promise.resolve()
        })
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    if (Array.isArray(json.items)) {
      for (let item in json.items) {
        this.data.items.push(new Item(item))
      }
    }
  }

  toJSON() {
    const data = {
      item: []
    }
    for (let item of this.data.items) {
      data.item.push(item.toJSON())
    }
    return JSON.stringify(data)
  }

}

module.exports = Items