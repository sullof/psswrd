'use strict'

/* globals Promise */

const path = require('path')
const assert = require('assert')

const fs = require('../lib/utils/fs')
const errors = require('../lib/errors')

describe('Psswrd', function () {

  let psswrd;

  before(function () {
    return fs.emptyDirAsync(path.resolve(__dirname, '../tmp'))
  })

  after(function () {
    return fs.emptyDirAsync(path.resolve(__dirname, '../tmp'))
  })

  it('should construct the instance', () => {

    return Promise.resolve(require('../lib/Psswrd'))
        .then(p => {
          assert(p.db === null, 'The db should be null')
          assert(p.masterPassword === null)
          assert(/\.psswrd$/.test(p.rootdir))
          psswrd = p;
        })
  })

  it('should initialize the store', () => {
    return psswrd.init()
        .then(exitCode => {
          assert(psswrd.db !== null)
        })
  })

  it('should use the current store', () => {
    return psswrd.use()
        .then(exitCode => {
          assert(psswrd.dbName === 'ZGVmYXVsdF9zdG9yZQ==')
        })
  })

  it('should throw and error if try to use a non existent store', () => {
    return psswrd.use('not-existent')
        .catch(error => {
          assert(error.message === errors.DbNotFound)
        })
  })

  it('should return that it is initialized', () => {
    return Promise.resolve(psswrd.isInitialized())
        .catch(error => {
          assert(error.message === errors.DbNotFound)
        })
  })

it('should init a git repo', () => {
  // TODO fix this
    return psswrd.gitInit('some-repo')
        .then(() => {
          assert(true)
        })
})

})
