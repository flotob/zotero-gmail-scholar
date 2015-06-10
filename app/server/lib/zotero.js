var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');
var Promise = require('bluebird');

// items: [{
//   itemType: 'journalArticle',
//   title: 'hallo123testeinszwo',
//   url: 'http://example.org',
//   files: []

function create (items, options) {
  items = _.isArray(items) ? items : [items];

  return new Promise(function (resolve, reject) {
    var logs = {
      definition: 'this is a logs array',
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
        console.log('py msg received && added to log');
        logs[resp.status == 'success' ? 'success' : 'fail'].push(resp.msg);
      } {
        console.log('py msg received BUT NOT added to log');
      }
    });    

    console.log('sending create request to zotero.py');
    // request
    request(pySh, 'create', {
      auth: config.zotero.credentials,
      items: items
    });

    // end the input stream and allow the process to exit
    pySh.end(function (err) {
      // reject promise if error returned
      if (err) {
        console.log('py end, error', err);
        reject(err, logs);
      } 
      // else continue
      else {
        console.log('py end, no error raised');
        resolve(logs);
        // delete cached pdf if stated so in options
        // if (options.delCachedFile) {
        //   // iterate over items array
        //   _.each(items, function (item) {
        //     // iterate over files array
        //     'files' in item && _.each(item.files, function (file) {
        //       // delete file
        //       fs.unlink(file, function (err, result) {
        //         // reject promise if removal failes
        //         if (err) reject (logs, err);
        //         // resolve promise if everything goes smooth
        //         else resolve(logs, result);
        //       });
        //     });
        //   })
        // }
      }
    });
  });
}

function request (pySh, subject, body) {
  console.log('py send request');
  pySh.send(JSON.stringify(_.extend(body, { subject:subject })));
}

module.exports = {
  create: create
}