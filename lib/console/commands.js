/* globals Promise */

const path = require('path')
const chalk = require('chalk')
const clear = require('clear')
const CLI = require('clui')
const figlet = require('figlet')

const inquirer = require('inquirer')
// inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
// inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));
// const ui = new inquirer.ui.BottomBar()

const ncp = require("copy-paste")

const Preferences = require('preferences')
const Spinner = CLI.Spinner

const _ = require('lodash')
const touch = require('touch')

const pkg = require('../../package')
const prefs = new Preferences('psswrd')

const psswrd = require('../Psswrd')

function color(str, c) {
  console.log(chalk[c](str))
}

function green(str) {
  color(str, 'green')
}

function grey(str) {
  color(str, 'grey')
}

function red(str) {
  color(str, 'red')
}

const context = {
  HOME: 0,
  LS: 1
}

class Commands {

  constructor() {
    this.workingDir = path.basename(process.cwd())
    this.context = context.HOME
  }

  start() {
    clear()
    console.log(chalk.black('psswrd ver ' + pkg.version))
    return psswrd.init()
        .then(() => {
          if (psswrd.isReady()) {
            green('Welcome back. Please login into your local account')
            return this.login()
                .then(() => this.menu())
          } else {
            green('Welcome! Please signup to create a local account')
            return this.signup()
                .then(() => this.menu())
          }
        })
  }

  clearTimeout() {
    if (typeof this.timeout === 'number') {
      clearTimeout(this.timeout)
    }
  }

  copyToClipboard(str, ms) {
    this.clearTimeout()
    return new Promise((resolve, reject) => {
      ncp.copy(str, err => {
        if (err) reject(err)
        else {
          if (ms) resolve(this.resetClipboard(ms))
          else resolve()
        }
      })
    })
  }

  resetClipboard(ms) {
    if (ms) {
      this.clearTimeout()
      this.timeout = setTimeout(function () {
        this.copyToClipboard('')
      }, ms)
      return Promise.resolve(this.timeout)
    } else {
      return this.copyToClipboard('')
    }
  }

  menu() {
    var questions = [
      {
        name: 'command',
        type: 'input',
        message: 'Type your command',
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return 'Please type your command, or help for help';
          }
        },
        filter: function (value) {
          return value.replace(/[^\w]+/g, '')
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(p => {
          switch (p.command) {
            case 'help':
              return this.help()
            case 'quit':
              return this.quit()
            case 'ls':
              return this.ls()
            default:
              grey('Command not recognized. Type help for help');
              return this.menu()
          }
        })
  }

  ls() {

    psswrd.ls()

    return this.menu()
  }

  help() {
    // shows command available in the current context

    const ls = chalk.green('ls') + '\n' + chalk.grey('  Lists all the secrets')
    const quit = chalk.green('quit') + '\n' + chalk.grey('  Quits psswrd')

    switch (this.context) {
      case context.HOME:
        console.log(
            [ls, quit].join('\n')
        )
    }
    return this.menu()
  }

  quit() {
    psswrd.onClose()
    setTimeout(clear, 300)
    console.log(chalk.green('Good bye!'))
  }

  login(callback) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Enter your master password:',
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your master password.';
          }
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(p => psswrd.login(p.password))
        .catch(err => {
          red('The password you typed is wrong. Try again or Ctrl-C to exit.')
          return this.login()
        })

  }

  signup(callback) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password';
          }
        }
      },
      {
        name: 'retype',
        type: 'password',
        message: 'Retype your password:',
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password';
          }
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(p => {
          if (p.password === p.retype) {
            return psswrd.signup(p.password)
          } else {
            red('The two passwords do not match. Try again')
            return this.signup()
          }
        })
        .catch(err => {
          red('Unrecognized error. Try again')
          return this.login()
        })
  }

}

module.exports = new Commands