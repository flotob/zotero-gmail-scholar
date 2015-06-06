var _ = require('lodash');
var jf = require('jsonfile');

var config = jf.readFileSync('config/config.json');

var file = '/var/folders/2j/5tfdfmhs2x10t_kgnhkbwgcc0000gn/T/printing.751.1/Creating PDF Workflow Options.pdf';

var PythonShell = require('python-shell');

var io = (function () {
  var pyshell = new PythonShell('zotero.py', { 
    scriptPath: './lib',
    pythonOptions: ['-u']
  });
  
  var send = function (subject, body) {
    pyshell.send( JSON.stringify(_.extend(body, { subject:subject } )));
  };

  var listen = function (callback) {
    pyshell.on('message', callback);
  };

  return {
    pub: send,
    sub: listen,
    kill: pyshell.end
  }
})();

io.pub('config', { credentials: config.zotero.credentials });

io.sub(function (msg) {
  // received a message sent from the Python script (a simple "print" statement)
  if (msg == 'config') {
    io.kill(function (err) {
      if (err) throw err;
      console.log('finished1');
    });
  }
});


// backup kill
io.kill(function (err) {
  if (err) throw err;
  console.log('finished2');
});


// PythonShell.run('zotero.py', {
//   mode: 'text',
//   args: [library_id, library_type, api_key, file]
// }, function (err) {
//   if (err) throw err;
//   console.log('finished');
// });