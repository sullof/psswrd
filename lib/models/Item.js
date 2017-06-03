const Crypto = require('../utils/Crypto')
const _ = require('lodash')

class Item {

  constructor(item) {
    this.fromJSON(item)
  }

  fromJSON(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    this.id = json.id
    this.password = json.password
    this.hash = json.hash
  }

  toJSON() {
    const data = _.pick(this, [
        'id',
        'password',
        'hash'
    ])
    return JSON.stringify(data)
  }
}

module.exports = Item