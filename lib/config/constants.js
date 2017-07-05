
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
    // just for consistency with other keys :-)
    MANIFEST: 'MNIFST',
    MASTERKEY:'MSTRKY'
  },

  SYNC: 1,
  ASYNC: 2
}

module.exports = constants