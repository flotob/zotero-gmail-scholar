var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');

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
    
    var py = new PythonShell('zotero.py', {
      scriptPath: './lib',
      pythonOptions: ['-u'],
      mode: 'text',
    });

    // register listener
    py.on('message', function (resp) {
      resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
      if (resp && 'status' in resp) {
        logs[resp.status == 'success' ? 'success' : 'fail'].push(resp.msg);
      }
    });    

    // request
    request('create', {
      auth: config.zotero.credentials,
      items: items
    });

    // end the input stream and allow the process to exit
    py.end(function (err) {
      // reject promise if error returned
      if (err) reject(err, logs);
      // else continue
      else {
        // delete cached pdf if stated so in options
        if (options.delCachedFile) {
          // iterate over items array
          _.each(items, function (item) {
            // iterate over files array
            'files' in item && _.each(item.files, function (file) {
              // delete file
              fs.unlink(file, function (err, result) {
                // reject promise if removal failes
                if (err) reject (logs, err);
                // resolve promise if everything goes smooth
                else resolve(logs, result);
              });
            });
          })
        }
      }
    });
  });
}

function request (subject, body) {
  py.send(JSON.stringify(_.extend(body, { subject:subject })));
}

module.exports = {
  create: create
}