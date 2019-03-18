let router        = require('express').Router()
let randomstring  = require('randomstring')

let formidable  = require('formidable')
let path        = require('path')
let fs          = require('fs')

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


/**
 * @api {get} /api/teams/<team_code> Retrieve a single team
 * @apiParam {String} team_code Team code (id).
 *
 * @apiGroup Teams
 * @apiSuccess {String} code Team code (id).
 * @apiSuccess {String} name Name of the team.
 * @apiSuccess {String} logo The team's logo (url).
 * @apiSuccess {String[]} competitions The competitions in the team is participating.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "code": "nl.saxion.ehi1vsa1",
 *      "name": "ehi1vsa1",
 *      "logo": "teamlogo_default.png",
 *      "competitions": [
 *          "useb_2019"
 *      ]
 *    }
 * @apiErrorExample {json} Query error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 404 Not Found
 */
router.get('/:team_code', function (req, res) {
  let where = {
    code: req.params.team_code
  }
  let fields = {
    code: true,
    name: true,
    logo: true,
    competitions: true,
    _id: false
  }
  Team.findOne(where, fields, function (err, team) {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Cannot find team'
      })
    }
    if (team === null || team.length == 0) {
      res.status(404).json({
        success: false,
        message: 'Cannot find team'
      })
    } else {
      res.status(200).json({
        success: true,
        message: 'Team retrieved succesfully',
        team: team
      })
    }
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
  processTeams(req.body.teams, function(result) {
    if (!result || !result.success){
      res.status(500).json(result)
    } else {
      res.status(201).json(result)
    }
  })
})

function processTeams(teams, callback) {
  // Validate input first.
  if (!teams || teams.length == 0) {
    return callback({
      succes: false,
      message: 'No teams to import'
    })
  }
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
      let result = {
        success: false,
        message: 'The teams already exist'
      }
      return callback(result)
    }
    let message = teamDocs.length + ' teams successfully imported'
    let result = {
      success: true,
      message: message,
      teams: teamDocs
    }
    return callback(result)
  })
}

// Handle an upload for a team
router.post('/upload/team', function (req, res) {
  // Create an form object
  var form = new formidable.IncomingForm()
  form.competition = req.header('X-Competition')
  form.multiples = true

  // Store all uploads in the /uploads directory
  var filepath = path.join(__dirname + '/../uploads/admin/teams.json');
  form.uploadDir = path.join(__dirname, '../uploads/admin/');

  // When file has been uploaded successfully,
  // rename it to it's orignal name.
  form.on('fileBegin', function (name, file){
    file.path = filepath
  })

  // Return a 500 in case of an error
  form.on('error', function(err) {
    res.status(500).json({
      success: false,
      message: err
    })
  })

  // Send a response to the client when file upload is finished.
  form.on('end', function() {
    var teams = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    processTeams(teams, function(result) {
      if (!result || !result.success) {
        res.status(500).json(result)
      } else {
        res.status(201).json(result)
      }
    })
  })

  // Parse the incoming request.
  form.parse(req)
})

module.exports = router
