#!/usr/bin/env node
let co        = require('co')
let prompt    = require('co-prompt')
let program   = require('commander')
let chalk     = require('chalk')
let config    = require('../config')
let mongoose  = require('mongoose')

var User = require('../models/User')

// Connect to the database
mongoose.Promise = require('bluebird')
mongoose.connect(config.database, { useCreateIndex: true, useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error : '))
db.once('open', function () {
  console.log('* Connected to database.')

  program
    .option('-u, --username <username>', 'The user to authenticate as')
    .option('-p, --password <password>', 'The user\'s password')
    .action(function(file) {
      co(function *() {
        var username = yield prompt('username: ')
        var password = yield prompt.password('password: ')
        return yield [username, password]
      })
      .then(function fulfilled(array) {
        let username = array[0]
        let password = array[1]

        // Create admin user.
        User.findOne({ name: username })
          .then(function(user) {
            if (!user) {
              // Create new admin user
              var adminUser = new User({
                name: username,
                password: password
              })
              adminUser.save(function (err, doc) {
                if(err) {
                  console.error(chalk.red('ERROR: Could not create admin user.'))
                  process.exit(1)
                } else {
                  console.log(chalk.green('* Admin user ceated!'))
                  process.exit(0)
                }
              })
            } else {
              // Update admin user (after confirmation)
              console.error(chalk.red('User already exists!'))
              co(function *() {
                return yield prompt('Do you want to update the password? (y/n): ')
              })
              .then(function fulfilled(confirm) {
                if (confirm === 'y') {
                  console.log('User update: '+username+", "+password)
                  user.password = password
                  user.save(function (err, doc) {
                    if(err) {
                      console.error(chalk.red('ERROR: Could not update admin user.'))
                      process.exit(1)
                    } else {
                      console.log(chalk.green('* Admin user updated!'))
                      process.exit(0)
                    }
                  })
                } else {
                  console.log(chalk.yellow('User not updated!'))
                  process.exit(0)
                }
              })
            }
          })
      })
      .catch(function rejected(err) {
        console.error(chalk.red('error:', err.stack))
        process.exit(1)
      })
    })
    .parse(process.argv)
})
