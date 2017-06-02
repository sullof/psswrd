/* globals Promise */

const psswrd = require('../Psswrd')

class Handlers {
  init(cmd, options, ctx) {
    const name = options.name;
    psswrd.init(name)
        .then(() => {
          return console.log('The store has been initialized')
        })
  }

  use(cmd, options, ctx) {
    // business logic
    console.log('created module \''.gray + options.name.green + '\' successfully'.gray)
  }

  isUseAvailable(ctx) {
    // any logic to determine if the command is available
    // if there are at least two databases
    return psswrd.isInitialized()
  }
}

module.exports = new Handlers()
