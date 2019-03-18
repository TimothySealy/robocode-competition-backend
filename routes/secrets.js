let router        = require('express').Router()
let randomstring  = require('randomstring')

var Team = require('../models/Team')

/***
 *
 * Protected endpoints below.
 *
 ***/
router.use(require('./api_authorization'))

/**
 * @api {get} /api/secrets List all teams (including secrets)
 * @apiGroup Teams
 * @apiHeader {String} x-authentication The JWT access token.
 *
 * @apiSuccess {Boolean} succes A boolean indicating whether the request was succesful.
 * @apiSuccess {String} message Error or succes message.
 * @apiSuccess {Teams[]} teams A list of teams.
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Teams succesfully retrieved",
 *    "teams": [{
 *      "code": "nl.saxion.ehi1vsa1",
 *      "name": "ehi1vsa1",
 *      "logo": "teamlogo_default.png",
 *      "secret_key": "5867374",
 *      "competitions": ["useb_2019"]
 *    },
 *    {
 *      ...
 *    }]
 *  }
 * @apiErrorExample {json} Query error
 *    HTTP/1.1 500 Internal Server Error
 */
router.get('/', function (req, res) {
  let where = {}
  let fields = {
    _id: false,
    __v: false
  }
  Team.find(where, fields, function (err, teams) {
    if (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: 'Cannot find teams'
      })
    }
    res.status(200).json({
      success: true,
      message: 'Teams succesfully retrieved',
      teams: teams
    })
  })
})

module.exports = router
