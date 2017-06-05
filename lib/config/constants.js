

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

    CONSTRUCTED: 0,
    INITIALIZED: 1,
    READY: 2,
    OPERATIVE: 3
  },

  keys: {
    MANIFEST: 'MANIFEST',
    MASTERKEY: 'MASTERKEY'
  }
}

module.exports = constants