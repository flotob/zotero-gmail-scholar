var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');
var Promise = require('bluebird');
var fs = require('fs');

var PySh = function () {
  return PythonShell('zotero.py', {
      scriptPath: './lib',
      pythonOptions: ['-u'],
      mode: 'text',
    });
}

function create (item, options) {
  return new Promise(function (resolve, reject) {
    var pySh = new PySh;

    // register listener
    pySh.on('message', function (resp) {
      resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
      if (resp && 'status' in resp) {

        if (resp['status']  == 'success' && 'msg' in resp && resp['msg']) {
          // delete cached pdf if stated so in options
          // if (options && 'delCachedFile' in options && options.delCachedFile) {
          //   // iterate over items array
          //   _.each(items, function (item) {
          //     // iterate over files array
          //     if ('files' in item) {
          //       item && _.each(item.files, function (file) {
          //         if (fs.existsSync(file)) {
          //           // delete file
          //           fs.unlink(file, function (err, result) {
          //             // reject promise if removal failes
          //             if (err) reject (logs, err);
          //             // resolve promise if everything goes smooth
          //             else resolve(logs, result);
          //           });
          //         }
          //         else resolve(logs);
          //       });
          //     }
          //     else resolve(logs);
          //   })
          // }
          // else {
          //   resolve(logs);
          // }

          resolve(resp['msg']);
        }
        else reject(resp)
      }
    });    

    // request
    request(pySh, 'create', {
      auth: config.zotero.credentials,
      item: item
    });

    // end the input stream and allow the process to exit
    pySh.end(function (err) {
      if (err) console.log(err);
    });
  });
}

function upload (file) {
  return new Promise(function (resolve, reject) {
    var pySh = new PySh;

    // register listener
    pySh.on('message', function (resp) {
      resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
      if (resp && 'status' in resp) {
        if (resp['status']  == 'success') 
          resolve();
        else
          reject('python: ' + 'msg' in resp && resp['msg'] ? resp['msg'] : 'something went horribly wrong');
      }
    });    

    // request
    request(pySh, 'upload', _.extend({ auth: config.zotero.credentials }, file));

    // end the input stream and allow the process to exit
    pySh.end(function (err) {
      if (err) console.log(err);
    });
  });
}

function request (pySh, subject, body) {
  pySh.send(JSON.stringify(_.extend(body, { subject:subject })));
}

module.exports = {
  create: create,
  upload: upload
}