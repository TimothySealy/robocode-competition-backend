let router  = require('express').Router()

var Ranking = require('../models/Ranking')

/**
 * @api {get} /api/rankings[?competition=<competition_code>&round=<round>]  List ranking for a specific competition and round.
 * @apiGroup Ranking
 * @apiParam {String} [competition]  Competition code for which the ranking should be filtered.
 * @apiParam {String} [round]  Round for which the ranking should be filtered.
 *
 * @apiSuccess {Boolean} succes A boolean indicating whether the request was succesful.
 * @apiSuccess {String} message Error or succes message.
 * @apiSuccess {Ranking[]} rankings The rankings (for a particular competition and/or round).
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Rankings succesfully retrieved",
 *    "rankings": [{
 *      "competition": "useb_2019",
 *      "round": 1,
 *      "entries": [{
 *        "team": {
 *          "code": "nl.saxion.ehi1vsa1",
 *          "name": "ehi1vsa1",
 *          "logo": "teamlogo_default.png",
 *        },
 *        "points": 3,
 *        "wins": 1,
 *        "loses": 0,
 *        "disqualifications": 0,
 *        "played": 1
 *      },
 *      {
 *        ...
 *      }]
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
  if (req.query.competition !== undefined) {
    where.competition = req.query.competition
  }
  if (req.query.round !== undefined) {
    where.round = req.query.round;
  }
  var fields = {}
  Ranking.find(where, fields, function (err, ranking) {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Cannot find rankings'
      })
    }
    let results = {
      success: true,
      message: 'Rankings succesfully retrieved',
      rankings: ranking
    }
    res.status(200).json(results)
  })
})

module.exports = router;
