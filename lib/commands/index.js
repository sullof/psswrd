var handlers = require('./handlers');

module.exports = [
  {
    name: 'init',
    help: 'Initialize a new store',
    // context: 'setup',
    handler: handlers.init,
    options: {
      name: {
        help: 'Name of the store',
        required: false,
        defaultValue: 'default_store'
      }
    }
  },
  {
    name: 'use',
    help: 'Uses a specific store',
    // context: 'setup',
    handler: handlers.use,
    options: {
      name: {
        help: 'Name of the store',
        required: false,
        defaultValue: 'default_store'
      }
    },
    isAvailable: handlers.isUseAvailable
  }
];
