let config  = require('../config')
let router  = require('express').Router()
let jwt     = require('jsonwebtoken')

router.use('/', function (req, res, next) {
  let token = req.headers['x-authentication']

  // Verify token
  if (token) {
    jwt.verify(token, config.secret, function (err, decoded) {
      // Return 401 if token is invalid.
      if (err) {
        return res.status(401).json({
          succes: false,
          message: 'Invalid token.'
        })
      }
      // Call the next in middleware.
      return next();
    });
  } else {
      return res.status(401).json({
        succes: false,
        message: 'No token was provided!'
      })
  }
})

module.exports = router
