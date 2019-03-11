let router        = require('express').Router()
let randomstring  = require('randomstring')

var Team = require('../models/Team')

/**
 * @api {get} /api/teams[?competition=<competition_code>] List all teams
 * @apiGroup Teams
 *
 * @apiParam {String} [competition]  Competition code for which the teams should be filtered.
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
  var where = {}
  if (req.query.competition !== undefined){
    where = { competitions: req.query.competition }
  }
  let fields = {
    secret_key: false,
    _id: false,
    __v: false
  }
  Team.find(where, fields, function (err, teams) {
    if (err) {
      console.error(err);
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

/***
 *
 * Protected endpoints below.
 *
 ***/
router.use(require('./api_authorization'))

/**
 * @api {post} /api/teams/all Import a list of teams (including secrets)
 * @apiGroup Teams
 * @apiHeader {String} x-authentication The JWT access token.
 *
 * @apiParam {Teams[]} teams The teams to imported.
 *
 * @apiSuccess {Boolean} succes A boolean indicating whether the request was succesful.
 * @apiSuccess {String} message Error or succes message.
 * @apiSuccess {Teams[]} teams A list of imported teams (including generate secrets if applicable).
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "3 teams succesfully successfully imported",
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
router.post('/all', function (req, res) {

  // Validate input first.
  if (!req.body.teams || req.body.teams.length == 0) {
    return res.status(400).json({
      succes: false,
      message: 'No teams to import'
    })
  }

  var teams = req.body.teams
  for (var i = 0, len = teams.length; i < len; i++) {
    // Force lower cases for the team code.
    teams[i].code = teams[i].code.toLowerCase()

    // Generat a secret key if none is supplied.
    if (teams[i].secret_key === undefined ) {
      teams[i].secret_key = randomstring.generate({
        length: 7,
        charset: 'numeric'
      })
    }
    // Sanity check for undefined competitions.
    if (teams[i].competitions === undefined) {
      teams[i].competitions = []
    }
  }

  Team.insertMany(teams, function (err, teamDocs) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'The teams already exist'
      })
    }
    let message = teamDocs.length + ' teams successfully imported'
    return res.status(201).json({
      success: true,
      message: message,
      teams: teamDocs
    })
  })
})

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
router.get('/all', function (req, res) {
  let where = {}
  let fields = { _id: false }
  Team.find(where, fields, function (err, teams) {
    if (err) {
      console.error(err);
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
