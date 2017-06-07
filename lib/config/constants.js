function toBase64(data) {
  return new Buffer(data).toString('base64')
}

const constants = {

  errors: {
    DbNotFound: 'Db not found.',
    RepoExists: 'Repo already exists.',
    NotInitialized: 'The database has not been initialized.',
    NotReady: 'Not ready.',
    SecretNotFound: 'Secret not found.',
    WrongId: 'The id is wrong.'
  },

  status: {
    CONSTRUCTED: 10,
    INITIATED: 20,
    READY: 30,
    OPERATIVE: 40
  },

  keys: {
    // this is only for aesthetic reasons :-)
    MANIFEST: toBase64('manifest'),
    MASTERKEY: toBase64('masterkey')
  }
}

module.exports = constants