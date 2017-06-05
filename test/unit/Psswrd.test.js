'use strict'

/* globals Promise */

const path = require('path')
const assert = require('assert')

const fs = require('../../lib/utils/fs')
const Crypto = require('../../lib/utils/Crypto')
const samples = require('../fixtures/samples')
const {status, keys} = require('../../lib/config/constants')
const Manifest = require('../../lib/models/Manifest')

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
    //return fs.emptyDirAsync(path.resolve(__dirname, '../../tmp'))
  })

  it('should construct the instance', () => {
    return Promise.resolve(require('../../lib/Psswrd'))
        .then(p => {
          assert(p.db)
          assert(/\.psswrd$/.test(p.rootdir))
          assert(p.db.dir === path.join(p.rootdir, 'database'))
          assert(p.status <= status.INITIALIZED)
          psswrd = p;
          return Promise.resolve()
        })
  })

  it('should initialize the store', () => {
    return psswrd.init()
        .then(() => {
          assert(psswrd.manifest instanceof Manifest)
          return Promise.resolve()
        })
  })

  it('should return an error trying to login', () => {
    return psswrd.login(password)
        .catch(err => {
          assert(err)
          return Promise.resolve()
        })
  })

  it('should signup and set up the master key', () => {
    return psswrd.signup(password)
        .then(() => {
          assert(psswrd.manifest.data)
          return psswrd.db.get(keys.MASTERKEY)
        })
        .then(encryptedMasterKey => {
          assert(encryptedMasterKey)
          return Promise.resolve()
        })
  })

  it('should login and recover the master key', () => {
    // the current status is OPERATIVE
    psswrd.status--
    // not it is READY
    return psswrd.login(password)
        .then(() => {
          assert(psswrd.manifest.data)
          return psswrd.db.get(reservedKeys.MASTERKEY)
        })
        .then(encryptedMasterKey => {
          assert(encryptedMasterKey)
          return Promise.resolve()
        })
  })


})
