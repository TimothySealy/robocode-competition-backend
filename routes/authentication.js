let config  = require('../config')
let jwt     = require('jsonwebtoken')
let router  = require('express').Router()

var User = require('../models/User')

/**
 * @api {post} /api/authenticate Authenticate a user
 * @apiGroup Authentication
 * @apiSuccess {Boolean} succes A boolean indicating whether the request was succesful.
 * @apiSuccess {String} message Error or succes message.
 * @apiSuccess {String} token The JWT token for the succesful login.
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Authentication succesful.",
 *    "token": "eyJhbGciOiJIUzI1..."
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
            message: 'Authentication succesful',
            token: token
          })
        } else {
          res.send({
            success: false,
            message: 'Authentication failed'
          })
        }
      })
    }
  })
})

module.exports = router
