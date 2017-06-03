'use strict'

/* globals Promise */

const path = require('path')
const assert = require('assert')

const fs = require('../../lib/utils/fs')
const Crypto = require('../../lib/utils/Crypto')
const samples = require('../fixtures/samples')
const {status} = require('../../lib/constants')
const Items = require('../../lib/models/Items')

describe('Psswrd', function () {

  let psswrd
  let password = 'a very yellow trip on a ferryboat in alaska'
  let masterKey

  before(function () {
    return fs.emptyDirAsync(path.resolve(__dirname, '../../tmp'))
        .then(() => Crypto.fromBase64(samples.base64MasterKey))
        .then(key => masterKey = key)
  })

  after(function () {
    // return fs.emptyDirAsync(path.resolve(__dirname, '../../tmp'))
  })

  it('should construct the instance', () => {
    return Promise.resolve(require('../../lib/Psswrd'))
        .then(p => {
          assert(p.db)
          assert(/\.psswrd$/.test(p.rootdir))
          assert(p.db.dir === path.join(p.rootdir, 'data'))
          assert(p.status <= status.INITIALIZED)
          psswrd = p;
          return Promise.resolve()
        })
  })

  it('should initialize the store', () => {
    return psswrd.init()
        .then(() => {
          assert(psswrd.index instanceof Items)
          return Promise.resolve()
        })
  })

  it('should set the master password', () => {
    return psswrd.signup(password)
        .then(() => {
          assert(psswrd.index.data)
          return psswrd.db.get('masterKey')
        })
        .then(encryptedMasterKey => {
          assert(encryptedMasterKey.length > 100)
          return Promise.resolve()
        })
  })


})
