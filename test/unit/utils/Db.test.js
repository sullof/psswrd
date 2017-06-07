'use strict'

/* globals Promise */

const path = require('path')
const assert = require('assert')

const fs = require('../../../lib/utils/fs')
const db = require('../../../lib/utils/Db')

describe('Db', function () {

  let dbDir = path.resolve(__dirname, '../../tmp/.psswrd/database2')
  let someEncryptedData = 'c29tZXRpbWVzIGl0IHJhaW5z'
  let id

  it('should start the db', () => {
    db.init(dbDir)
    assert(fs.existsDir(dbDir))
  })

  it('should return a new id', () => {
    return db.newId()
        .then(newId => Promise.resolve(assert(id = newId)))
  })

  it('should save some data', () => {
    return db.put(id, someEncryptedData)
        .then(() => {
          assert(fs.existsSync(path.join(dbDir, id)))
        })
  })

  it('should read the saved data', () => {
    return db.get(id)
        .then(data => {
          assert(data === someEncryptedData)
        })
  })
})