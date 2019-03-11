let router  = require('express').Router()

var Competition = require('../models/Competition')

/**
 * @api {get} /api/competition List all competitions
 * @apiGroup Competitions
 * @apiSuccess {Competition[]} competitions A list of competitions.
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Competitions succesfully retrieved",
 *    "competitions": [{
 *      "code": "useb_2019",
 *      "name": "USEB 2019",
 *      "description": "The Ultimate SElection Battle 2019",
 *      "rounds": [2,1]
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
  var fields = {
    code: true, 
    name: true,
    description: true,
    current_round: true,
    rounds: true,
    _id: false}
  Competition.find(where, fields, function (err, competitions) {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Cannot find competitions"
      })
    }
    var results = {
      success: true,
      message: "Competitions succesfully retrieved",
      competitions: competitions
    }
    res.status(200).json(results)
  })

})


/***
 *
 * Protected endpoints below.
 *
 ***/
var authz = require('./api_authorization');
router.use(authz);

/**
 * @api {post} /api/competition/ Create a new competition
 *
 * @apiGroup Competitions
 * @apiParam {String} code Competition code (id).
 * @apiParam {String} name Name of the competition.
 * @apiParam {String} [description] The competition's description.
 * @apiParam {Number} [current_round] The competition's current round.
 * @apiParam {Number[]} [rounds] The rounds in the competition so far.
 *
 * @apiSuccess {Boolean} error A boolean indicating whether an error has occurred.
 * @apiSuccess {String} message Error or succes message
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 201 Created
 *    {
 *      "succes": true,
 *      "message": "Competition useb_2017 created."
 *    }
 * @apiErrorExample {json} Query error
 *    HTTP/1.1 409 Conflict
 *    HTTP/1.1 400 Not Found
 */
router.post('/', function (req, res) {

  // Validate input first.
  if (!req.body.code || req.body.code === "") {
    return res.status(400).json({
      succes: false,
      message: "Invalid code for competition."
    })
  }

  if (!req.body.name || req.body.name === "") {
    return res.status(400).json({
      succes: false,
      message: "Invalid name for competition."
    })
  }

  // User can create a competition with some predefined rounds.
  // The current_round then needs to in the range of the supplied rounds.
  // Also the rounds should be (continually) ascending.
  var valid_current_round = true
  if (req.body.current_round !== undefined) {
    valid_current_round = false
    var rounds = req.body.rounds
    if (rounds !== undefined) {
      for (var i = 0, len = rounds.length; i < len; i++) {
        if (rounds[i] === req.body.current_round) {
          valid_current_round = true
          break
        }
      }
    }
  }
  if (!valid_current_round) {
    return res.status(400).json({
      succes: false,
      message: "Current round is invalid"
    })
  }

  // Create new competition
  var newCompetition = new Competition()
  newCompetition.code = req.body.code
  newCompetition.name = req.body.name
  newCompetition.description = req.body.description
  newCompetition.current_round = req.body.current_round
  newCompetition.rounds = req.body.rounds

  // Save new competition
  newCompetition.save(function (err) {
    if (err) {
      return res.status(409).json({
        success: false,
        message: "Can't save the new competition"
      })
    }
    // Return 201
    return res.status(201).json({
      success: true,
      message: "Competition "+ newCompetition.code +" created"
    })
  })
})

module.exports = router
