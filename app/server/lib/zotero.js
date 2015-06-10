var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');
var Promise = require('bluebird');
var fs = require('fs');

// items: [{
//   itemType: 'journalArticle',
//   title: 'hallo123testeinszwo',
//   url: 'http://example.org',
//   files: []

function create (items, options) {

  items = _.isArray(items) ? items : [items];
  return new Promise(function (resolve, reject) {
    var logs = {
      success: [],
      fail: []
    };
    
    var pySh = new PythonShell('zotero.py', {
      scriptPath: './lib',
      pythonOptions: ['-u'],
      mode: 'text',
    });

    // register listener
    pySh.on('message', function (resp) {
      resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
      if (resp && 'status' in resp) {
        logs[resp.status == 'success' ? 'success' : 'fail'].push(resp.msg);
      }
    });    

    // request
    request(pySh, 'create', {
      auth: config.zotero.credentials,
      items: items
    });

    // end the input stream and allow the process to exit
    pySh.end(function (err) {
      // reject promise if error returned
      if (err) {
        reject(err, logs);
      } 
      // else continue
      else {
        // delete cached pdf if stated so in options
        if (options && 'delCachedFile' in options && options.delCachedFile) {
          // iterate over items array
          _.each(items, function (item) {
            // iterate over files array
            if ('files' in item) {
              item && _.each(item.files, function (file) {
                if (fs.existsSync(file)) {
                  // delete file
                  fs.unlink(file, function (err, result) {
                    // reject promise if removal failes
                    if (err) reject (logs, err);
                    // resolve promise if everything goes smooth
                    else resolve(logs, result);
                  });
                }
                else resolve(logs);
              });
            }
            else resolve(logs);
          })
        }
        else {
          resolve(logs);
        }
      }
    });
  });

}

function request (pySh, subject, body) {
  pySh.send(JSON.stringify(_.extend(body, { subject:subject })));
}

module.exports = {
  // create: _.throttle(create, 5000)
  create: create
}