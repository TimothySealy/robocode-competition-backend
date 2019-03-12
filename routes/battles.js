let router  = require('express').Router()

var Battle = require('../models/Battle')

/**
 * @api {get} /api/battle[?team_name=<team_name>]  List all battles for a specific team.
 * @apiGroup Battles
 * @apiParam {String} [team_name]  Team name for which the battle list should be filtered.
 *
 * @apiSuccess {Boolean} succes A boolean indicating whether the request was succesful.
 * @apiSuccess {String} message Error or succes message.
 * @apiSuccess {Battle[]} battles A list of battles.
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Battles succesfully retrieved",
 *    "battles": [{
 *      "competition": "useb_2019",
 *      "round": 1,
 *      "scorefile": "nl.saxion.ehi1vsa1-nl.saxion.ehi1vsa2.result",
 *      "replayfile": "nl.saxion.ehi1vsa1-nl.saxion.ehi1vsa2.br",
 *      "datetime": "2019-02-10T15:46:51.778Z",
 *      "teams": [{
 *        "team_name": "nl.saxion.ehi1vsa1",
 *        "points": 3,
 *        "totalscore": 3511,
 *        "survivalscore": 1550,
 *        "survivalbonus": 40,
 *        "bulletdamage": 1226,
 *        "bulletBonus": 173,
 *        "ramdamage": 462,
 *        "rambonus": 60,
 *        "firsts": 1,
 *        "seconds": 2,
 *        "thirds": 0
 *      },
 *      {
 *        "team_name": "nl.saxion.ehi1vsa2",
 *        "points": 1,
 *        "totalscore": 2154,
 *        "survivalscore": 850,
 *        "survivalbonus": 120,
 *        "bulletdamage": 1014,
 *        "bulletBonus": 148,
 *        "ramdamage": 22,
 *        "rambonus": 0,
 *        "firsts": 2,
 *        "seconds": 1,
 *        "thirds": 0
 *      }]
 *    },
 *    {
 *      ...
 *    }]
 *  }
 * @apiErrorExample {json} Find error
 *    HTTP/1.1 500 Internal Server Error
 */
router.get('/', function (req, res) {
  // TODO: add some paging here because the list of battles
  // can potentialy be very large.
  var where = {}
  if (req.query.team_name !== undefined) {
    where = {teams: {$elemMatch: {team_name: req.query.team_name}}}
  }
  var fields = {}
  Battle.find(where, fields, function (err, battles) {
    if (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Cannot find battles'
      })
    }
    let results = {
      success: true,
      message: 'Battles succesfully retrieved',
      battles: battles
    }
    res.status(200).json(results)
  })
})

module.exports = router
