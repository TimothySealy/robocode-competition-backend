let config  = require('../config')
let jwt     = require('jsonwebtoken')
let router  = require('express').Router()

var User = require('../models/User')

/**
 * @api {post} /api/authenticate Authenticate a user
 * @apiGroup Authentication
 * @apiSuccess {Message} message A message containing a JWT token.
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Authentication succesful.",
 *    "token": "eyJhbGciOiJIUzI1...",
 *    "expiresIn": 1440
 *   }
 * @apiErrorExample {json} Query error
 *    HTTP/1.1 500 Internal Server Error
 */
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
