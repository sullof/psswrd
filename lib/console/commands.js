/* globals Promise */

const path = require('path')
const chalk = require('chalk')
const clear = require('clear')
const CLI = require('clui')
const figlet = require('figlet')

const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
const fuzzy = require('fuzzy')
// inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));
// const ui = new inquirer.ui.BottomBar()

const ncp = require('copy-paste')
const Minimatch = require("minimatch").Minimatch

const filter = (array, pattern) => {
  return array.filter(minimatch.filter(pattern, {matchRe: true, nocase: true}))
}

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
  HOME: 'home',
  SECRET: 'secret'
}

const allCommands = {}
allCommands[context.HOME] = [
  'ls',
  'help',
  'quit'
]
let commands

class Commands {

  constructor() {
    this.rootDir = process.cwd()
    this.setContext(context.HOME)
  }

  setContext(ctx) {
    this.context = ctx
    commands = allCommands[ctx]
  }

  searchCommands(answers, input) {
    input = input || ''
    return new Promise(resolve => {
      // setTimeout(() => {
      var fuzzyResult = fuzzy.filter(input, commands)
      resolve(fuzzyResult.map(el => {
        return el.original
      }))
      // }, _.random(30, 200))
    })
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
      this.timeout = setTimeout(() => {
        this.copyToClipboard('')
      }, ms)
      return Promise.resolve(this.timeout)
    } else {
      return this.copyToClipboard('')
    }
  }

  menu() {
    inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'command',
        suggestOnly: true,
        message: 'Type your command',
        source: this.searchCommands,
        pageSize: 4,
        validate: val => {
          return val
              ? true
              : 'Type something!';
        }
      }
    ]).then(answers => {
      const cmd = answers.command.trim().replace(/\s+/, ' ').split(' ')
      const command = cmd[0]
      const params = cmd.splice(1).join(' ')
      if (!!~commands.indexOf(command)) {
        return this[command](params);
      } else {
        console.log([
          chalk.grey('Command'),
          chalk.cyan(command),
          chalk.grey('not recognized. Type help for help')
        ].join(' '))
        return this.menu()
      }
    });
  }

  // menu() {
  //   var questions = [
  //     {
  //       name: 'command',
  //       type: 'input',
  //       message: 'Type your command',
  //       validate: function (value) {
  //         if (value.length) {
  //           return true;
  //         } else {
  //           return 'Please type your command, or help for help';
  //         }
  //       }
  //     }
  //   ]
  //   return inquirer.prompt(questions)
  //       .then(p => {
  //         const cmd = p.command.trim().replace(/\s+/, ' ').split(' ')
  //         const command = cmd[0]
  //         const params = cmd.splice(1).join(' ')
  //         switch (command) {
  //           case 'help':
  //             return this.help(params)
  //           case 'quit':
  //             return this.quit()
  //           case 'ls':
  //             return this.ls(params)
  //           case 'add':
  //             return this.add(params)
  //           default:
  //             console.log([
  //               chalk.grey('Command'),
  //               chalk.cyan(command),
  //               chalk.grey('not recognized. Type help for help')
  //             ].join(' '))
  //             return this.menu()
  //         }
  //       })
  // }

  ls() {

    // psswrd.ls()


    return this.menu()
  }

  help() {
    // shows command available in the current context

    const ls = chalk.green('ls [options]') + '\n' + chalk.grey('  Lists all the secrets')
    const help = chalk.green('help [command]') + '\n' + chalk.grey(`  Shows this help or [command]'s help`)
    const quit = chalk.green('quit') + '\n' + chalk.grey('  Quits psswrd')

    switch (this.context) {
      case context.HOME:
        console.log(
            [ls, help, quit].join('\n')
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
        validate: value => {
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
        validate: value => {
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
        validate: value => {
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