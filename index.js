const psswrd = require('./lib/Psswrd')
const shell = require('simple-shell')
const commands = require('./lib/commands')

function startConsole() {

  shell.initialize({
    author: 'Frankie Bones'
  })

  commands.forEach(function(cmd) {
    shell.registerCommand(cmd)
  })

  console.log('Type ' + 'help'.green + ' to get started. To get help for any command just suffix the comand with ' + 'help'.green)

  shell.startConsole()
}


psswrd.init()
    .then(() => {

      startConsole()
    })
    .catch(err => {
      console.error(err)
      startConsole()
    })



