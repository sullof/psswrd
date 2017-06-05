
/* globals Promise */

const path = require('path')
const chalk = require('chalk')
const clear = require('clear')
const CLI = require('clui')
const figlet = require('figlet')
const inquirer = require('inquirer')
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

function red(str) {
  color(str, 'red')
}

class Commands {

  constructor() {
    this.workingDir = path.basename(process.cwd())
  }

  start() {
    clear()
    console.log(chalk.blue('psswrd ver '+ pkg.version))
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

  menu() {
    var questions = [
      {
        name: 'command',
        type: 'input',
        message: 'Type your command',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please type your command, or help for help';
          }
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(p => {
          if (p.command === 'help') {
            return this.help()
          }
          if (p.command === 'exit') {
            return this.exit()
          } else if (value.length) {
            return this.cmd(p)
          } else {
            return 'Please type your command, or help for help';
          }
        })
  }

  help() {
    // shows command available in the current context
    console.log('exit to exit')
    return this.menu()
  }

  cmd(p) {
    var questions = [
      {
        name: 'command',
        type: 'input',
        message: 'Type command (help for help)',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password';
          }
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(results => {
          this.results = results
          return this.menu()
        })

  }

  next() {
    return this.next
  }

  exit(){
    psswrd.onClose()
    console.log(chalk.green('Good bye!'))
  }


  login(callback) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password';
          }
        }
      }
    ]
    return inquirer.prompt(questions)
        .then(p => psswrd.login(p.password))
        .catch(err => {
          red('The password you typed is wrong. Try again')
          return this.login()
        })

  }

  signup(callback) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function(value) {
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
        validate: function(value) {
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
          red('The password you typed is wrong. Try again')
          return this.login()
        })
  }

}

module.exports = new Commands