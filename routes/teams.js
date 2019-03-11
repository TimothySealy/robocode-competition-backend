let router  = require('express').Router()

var Team = require('../models/Team')

/**
 * @api {get} /api/teams List all teams
 * @apiGroup Teams
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
  let fields = {secret_key: false}
  Team.find(where, fields, function (err, teams) {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Cannot find teams"
      })
    }
    res.status(200).json({
      success: true,
      message: "Teams succesfully retrieved",
      teams: teams
    })
  })
})

/***
 *
 * Protected endpoints below.
 *
 ***/
router.use(require('./api_authorization'))

/**
 * @api {get} /api/teams/all List all teams (including secrets)
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
 *      "competitions": ["useb_2019"]
 *    },
 *    {
 *      ...
 *    }]
 *  }
 * @apiErrorExample {json} Query error
 *    HTTP/1.1 500 Internal Server Error
 */
router.get('/all', function (req, res) {
  let where = {}
  let fields = {}
  Team.find(where, fields, function (err, teams) {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Cannot find teams"
      })
    }
    res.status(200).json({
      success: true,
      message: "Teams succesfully retrieved",
      teams: teams
    })
  })
})

module.exports = router
