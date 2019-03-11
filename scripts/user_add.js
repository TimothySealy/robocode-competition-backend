#!/usr/bin/env node
let co        = require('co')
let prompt    = require('co-prompt')
let program   = require('commander')
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
        console.log('user: %s, pass: %s', username, password)

        // Create admin user.
        var query = { name: username }
        User.findOne(query, function(err, user) {
          if (err) throw err
          if (user) {
            console.log('User already exists!')
            process.exit(1)
          } else {
            var adminUser = new User({
              name: username,
              password: password
            })
            adminUser.save(function (err, doc) {
              if(err) {
                console.log('ERROR: Could not create admin user.')
                process.exit(1)
              } else {
                console.log('* Admin user created!')
                process.exit(0)
              }
            })
          }
        })
     })
    })
    .parse(process.argv)
})
