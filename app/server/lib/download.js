var Promise = require('bluebird');
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var path = require('path');
var query = require('querystring');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var sanitize = require('sanitize-filename');

var root = path.dirname(require.main.filename);

// http://stackoverflow.com/a/22907134/899586
// + promisified
// + https added
var now = function(fileurl, filename) {
  return new Promise(function (resolve, reject) {
    var filepath = path.join(root, config.cache, filename);
    var file = fs.createWriteStream(filepath);
    var protocols = {
      http: http,
      https: https
    };
    var protocol = url.parse(fileurl).protocol.slice(0,-1);

    if(protocols[protocol]) {
      var request = protocols[protocol].get(fileurl, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(function () {resolve.call(this, filepath, arguments)});  // close() is async, call cb after close completes.
        });
      }).on('error', function(err) { // Handle errors
        fs.unlink(config.cache); // Delete the file async. (But we don't check the result)
        reject(err.message);
      });
    }
  });
};

var isPDF = function (clean_url) {
      var pdf = clean_url.match(/\.pdf$/i);

      return pdf ? pdf.input : false;
}

var cleanURL = function (google_url) {
  var clean_url = query.parse( url.parse( google_url ).query ).url;

  return clean_url ? clean_url : google_url;
}

// e.g. filename($(e).text(), 'pdf');
function filename(string, extension) {
  return sanitize(string).replace(/ /g,"_").substring(0,65).toLowerCase() + '.' + extension;
}

module.exports = {
  now: now,
  isPDF: isPDF,
  cleanURL: cleanURL,
  filename: filename
};