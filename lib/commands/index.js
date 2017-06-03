const handlers = require('./handlers');

module.exports = [
  {
    name: 'login',
    help: 'Login in your local account',
    // context: 'setup',
    handler: handlers.login,
    options: {
      password: {
        help: 'Your master password',
        required: true
      }
    },
    isAvailable: handlers.showLogin
  },

  {
    name: 'signup',
    help: 'Signup to your local account',
    // context: 'setup',
    handler: handlers.signup,
    options: {
      password: {
        help: 'Your master password',
        required: true
      }
    },
    isAvailable: handlers.showSignup
  }
  // ,
  // {
  //   name: 'use',
  //   help: 'Uses a specific store',
  //   // context: 'setup',
  //   handler: handlers.use,
  //   options: {
  //     name: {
  //       help: 'Name of the store',
  //       required: false,
  //       defaultValue: 'default_store'
  //     }
  //   },
  //   isAvailable: handlers.isUseAvailable
  // }
];
