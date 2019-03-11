#!/usr/bin/env node
let co      = require('co')
let prompt  = require('co-prompt')
let program = require('commander')

program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .action(function(file) {
    co(function *() {
      var username = yield prompt('username: ')
      var password = yield prompt.password('password: ')
      console.log('user: %s, pass: %s', username, password)
   })
  })
  .parse(process.argv)
