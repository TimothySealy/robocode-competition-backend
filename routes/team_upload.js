let admzip      = require('adm-zip')
let formidable  = require('formidable')
let path        = require('path')
let fs          = require('fs')

var Team = require('../models/Team')

function uploadJar(req, res) {
  var secret_key = req.header('X-Authentication')

  // Create an form object
  var form = new formidable.IncomingForm()
  form.multiples = true;

  // Store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads/')

  var fields = {
    code: true,
    name: true,
    logo: true,
    competitions: true,
    _id: false
  }
  Team.findOne({'secret_key': secret_key}, fields, function (err, teamDoc) {
    if (err) {
      console.error(err)
      res.status(500).json({
        'error':true,
        message: 'Error uploading file. Team with given code not found'
      })
    }
    if (teamDoc === null || teamDoc.length == 0) {
      res.status(404).json({
        'error':true,
        message: 'Error uploading file. Team with given code not found'
      })
    } else {
      var filename;
      form.on('fileBegin', function (name, file){
          //TODO: The file will only be stored in the first competition where the team is in. FIX THIS FOR MULTIPLE COMPEITITIONS
          var foldername = __dirname + '/../uploads/' + teamDoc.competitions[0]

          //Create a folder for the competition if it does not exists.
          if (!fs.existsSync(foldername)){
              fs.mkdirSync(foldername)
          }

          //Store file in the created folder.
          file.path = path.join(foldername + '/' + teamDoc.name + '.jar')
          filename = file.path
      });

      // Return a 500 in case of an error
      form.on('error', function(err) {
        res.status(500).json({'error':true, 'message': err})
      })

      // Send a response to the client when file upload is finished.
      form.on('end', function() {
        //Check the file, list all files in it
        try {
          console.log('Checking file ' + filename)
          checkTeamfile('nl.saxion.' + teamDoc.name.toLowerCase(), filename)
          res.status(201).json({
            'error':false,
            'message':'Upload succesfull.'
          })
        } catch (error) {
          if (fs.existsSync(filename)) {
            fs.unlinkSync(filename)
          }
          console.error(error);
          res.status(400).json({
            'error':true,
            'message': 'The file does not meet the requirements: ' + error
          })
        }
      })

      // Parse the incoming request.
      form.parse(req)
    }
  })
}

/**
 * Check the given JAR file for some consistency checks:
 * If it contains a teamfile
 * If it contains exactly 4 robots
 * If it uses the correct pagename
 * @param packagename The packagename that should be used
 * @param path
 * @return true when everything ok, else throws an error
 */
var checkTeamfile = function(packagename, path) {
  var teamfiles = [];
  var classDefs = [];

  var zip = new admzip(path)
  var zipEntries = zip.getEntries()
  for (var i in zipEntries) {
    var zipEntry = zipEntries[i]
    var filename = zipEntry.entryName
    if (filename.indexOf('.team') == filename.length - 5) {
      teamfiles.push(filename)
    }
    if (filename.indexOf('.class') == filename.length - 6) {
      classDefs.push(filename.substr(0, filename.length - 6).replace(/\//g, '.').trim())
    }
  }

  //Check if there is exactly 1 teamfile, and if the classfiles are all in the correct package (or subpackages)
  if (teamfiles.length != 1) {
    throw 'There must be exactly 1 teamfile in the JAR file, yours has ' + teamfiles.length;
  }
  if (classDefs.length == 0) {
    throw 'There must be a minimum of one class file inside the JAR. You have 0';
  }
  for (var k in classDefs) {
    var classDef = classDefs[k].toLowerCase();
    if (classDef.indexOf(packagename) != 0) {
        throw 'All classes should be in package ' + packagename + '. The class ' + classDef + ' is not!';
    }
  }

  //Check the content of the teamfile
  var teamfile = teamfiles[0];
  var teamname = teamfile.substr(0, teamfile.length - 5);
  teamname = teamname.replace(/\//g, '.');

  //Read file contents
  var contents = zip.readAsText(teamfile);
  var contentsArray = contents.split('\n');
  for (var j in contentsArray) {
    var line = contentsArray[j];

    //Check the teammembers
    if (line.startsWith('team.members=')) {
      var robotcount = 0;
      var robots = line.substr(13).split(',');
      for (var k in robots) {
        var robot = robots[k].trim();
        if (classDefs.indexOf(robot) <= -1) {
          if (classDefs.indexOf(robot.substr(0, robot.length - 1)) <= -1) {
            throw 'Classfile for robot ' + robot + ' not found';
          }
        }
        robotcount++;
      }

      if (robotcount!=4) {
        throw 'There must be 4 robots in the team, found ' + robotcount;
      }
    }

    //Check the robocode version
    if (line.startsWith('robocode.version=')) {
      if (line.indexOf('1.9.3.0') <= -1) {
        throw 'Wrong robocode version, must be 1.9.3.0, found ' + line.substr(17);
      }
    }
  }
}

module.exports.uploadJar = uploadJar
