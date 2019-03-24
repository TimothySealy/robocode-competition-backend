let router      = require('express').Router()
let formidable  = require('formidable')
let path        = require('path')
let fs          = require('fs')

var Battle = require('../models/Battle')
var Competition = require('../models/Competition')
var Ranking = require('../models/Ranking')

/**
 * @api {get} /api/battle[?competition=<competition_code>&round=<round>team_name=<team_name>]  List all battles for a specific team.
 * @apiGroup Battles
 * @apiParam {String} [competition]  Competition code for which the battle list should be filtered.
 * @apiParam {String} [round]  Round for which the battle list should be filtered.
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
  if (req.query.competition !== undefined) {
    where.competition = req.query.competition
  }
  if (req.query.round !== undefined) {
    where.round = req.query.round
  }
  if (req.query.team_name !== undefined) {
    where.teams = {$elemMatch: {team_name: req.query.team_name}}
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

//--------------------------------------------------------------------------------------------------------------------

var authz = require('./api_authorization')
router.use(authz)

//--------------------------------------------------------------------------------------------------------------------


// Handle an upload for battles
router.post('/upload', function (req, res) {
  uploadFile(req, res)
})

function uploadFile(req, res) {
  // Create an form object
  var form = new formidable.IncomingForm()
  form.competition = req.header('X-Competition')
  form.round = req.header('X-CompetitionRound')

  form.multiples = true

  // Store all uploads in the /uploads directory
  var filepath = path.join(__dirname + '/../uploads/admin/battle_result.json')
  form.uploadDir = path.join(__dirname, '../uploads/admin/')

  // When file has been uploaded successfully,
  // rename it to it's orignal name.
  form.on('fileBegin', function (name, file) {
    file.path = filepath
  })

  // Return a 500 in case of an error
  form.on('error', function(err) {
    res.status(500).json({'error':true, 'message': err})
  })

  // Send a response to the client when file upload is finished.
  form.on('end', function() {
    // Check if we have a round and competition.
    if (!isValid(form.competition) || !isValid(form.round)) {
      return res.status(500).json({'error':true, 'message': 'No valid competition or roudn specified.'})
    }
console.log("Comp: "+form.competition)
console.log("Round: "+form.round)
    var fields = {}
    Competition.findOne({code: form.competition, rounds:form.round}, fields,  function (err, competitions) {
      if (err) {
        console.log("Error querying competition: "+err)
        return res.status(500).json({'error':true, 'message': 'Cannot find competition and round'})
      }
console.log("Comps: "+competitions)
console.log("Filepath: "+filepath)

      if (competitions === null || competitions === undefined) {
        // Let's simply add the battles (which automatically
        // computes the ranking) and update the rounds in competition.
        insertBattles(filepath, form.competition, form.round, res)
      } else {
        // We already have a round in the competition. Let's replace the ranking and battles.
        // Clean up first:
        // 1. Ranking for round
        // 2. Battles for round
        // 3. Round in competition
        Ranking.deleteMany({competition: form.competition, round: form.round}, function (err) {
          if (err) {
            console.log("Error removing previous ranking: "+err);
            return res.status(500).json({'error':true, 'message': 'Cannot remove previous ranking.'})
          }
          Battle.deleteMany({competition: form.competition, round: form.round}, function (err) {
            if (err) {
              console.log("Error removing previous battles: "+err);
              return res.status(500).json({'error':true, 'message': 'Cannot remove previous battles.'})
            }
            Competition.findOneAndUpdate({code: form.competition}, {$pull: {rounds: form.round}}, function(err, data){
              if (err) {
                console.log("Error updating rounds in competition: "+err)
                return res.status(500).json({'error':true, 'message': 'Cannot update rounds in competition.'})
              }
              insertBattles(filepath, form.competition, form.round, res)
            })
          })
        })
      }
    })
  })

  // Parse the incoming request.
  form.parse(req)
}

/**
 * Checks if the supplied parameter is not null, undefined or an empty string.
 * @param toCheck
 * @returns {boolean}
 */
var isValid = function(toCheck) {
  if (toCheck === undefined || toCheck === null || toCheck === "") {
    return false
  }
  return true
}

/**
 * Inserts the battles in the database.
 * @param filepath
 * @param competition
 * @param round
 * @param res
 */
var insertBattles = function(filepath, competition, round, res) {
  var battles = JSON.parse(fs.readFileSync(filepath, 'utf8'))
  for (var i = 0, len = battles.length; i < len; i++) {
    battles[i].competition = competition
    battles[i].round = round
console.log("Comp: "+competition+" Round: "+round)
  }
  console.log("Battles(1): "+battles)

  Battle.insertMany(battles, function (err, battleDocs) {
    if (err) {
      console.log("Error inserting battles: "+err)
      return res.status(500).json({'error':true, 'message': 'The battles already exist.'})
    }
console.log("Battles(2): "+battleDocs)

    // Update rounds in the competition.
    Competition.findOneAndUpdate({code: competition}, {$push:{rounds:round}}, function(err, doc){
      if(err){
        console.log("Something wrong when updating competition!")
        return res.status(500).json({'error':true, 'message': 'Something wrong when updating competition!'})
      }
      //var message = battleDocs.length + ' battles were successfully stored.';
      //TODO: FIX the message below. The variable battleDocs is not available due to async hell
      var message = 'succesfully stored'
      return res.status(201).json({'error':false, 'message': message})
    })
  })
}

module.exports = router
