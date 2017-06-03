/* globals Promise */

const psswrd = require('../Psswrd')

class Handlers {
  login(cmd, options, ctx) {
    const password = json.password;
    psswrd.login(password)
        .then(() => {
          return console.log('Your data are available.')
        })
  }

  showLogin(ctx) {
    // any logic to determine if the command is available
    // if there are at least two databases
    return psswrd.allowLogin()
  }

  signup(cmd, options, ctx) {
    const password = json.password;
    psswrd.signup(password)
        .then(() => {
          return console.log('Your data are available.')
        })
  }

  showSignup(ctx) {
    // any logic to determine if the command is available
    // if there are at least two databases
    return psswrd.allowSignup()
  }
}

module.exports = new Handlers()
