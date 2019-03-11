let jwt     = require('jsonwebtoken')
let router  = require('express').Router()

var User = require('../models/User')

router.post('/', function (req, res) {
  User.findOne({
    name: req.body.username
  }, function(err, user) {
    if (err) throw err

    if (!user) {
      res.send({
        success: false,
        message: 'Authentication failed.'
      })
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // Found user let's create a token.
          var token = jwt.sign({username: user.username },
            config.secret, {
              expiresIn: '7d'
            })

          // Return token
          res.json({
            success: true,
            message: 'Authentication succesful.',
            token: token,
            expiresIn: 1440
          })
        } else {
          res.send({
            success: false,
            message: 'Authentication failed.'
          })
        }
      })
    }
  })
})

module.exports = router
