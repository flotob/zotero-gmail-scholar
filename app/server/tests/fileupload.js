var _ = require('lodash');
var jf = require('jsonfile');

var config = jf.readFileSync('config/config.json');

var files = ['/ripple.pdf'];

var PythonShell = require('python-shell');

var pyshell = new PythonShell('zotero.py', {
  scriptPath: './lib',
  pythonOptions: ['-u']
});

function send (subject, body) {
  pyshell.send(JSON.stringify(_.extend(body, { subject:subject })));
}

// sends a message to the Python script via stdin
send('config', config.zotero.credentials);
send('upload', { files:files } ); 

pyshell.on('message', function (raw) {
  resp = JSON.parse(raw);
  console.log(resp);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});






// var io = (function () {
//   // var pyshell = new PythonShell('zotero.py', { 
//   //   // scriptPath: '../blubb/lib',
//   //   // pythonOptions: ['-u']
//   // });
  
//   var send = function (subject, body) {
//     pyshell.send( JSON.stringify(_.extend(body, { subject:subject } )));
//   };

//   var listen = function (callback) {
//     pyshell.on('message', callback);
//   };

//   return {
//     pub: send,
//     sub: listen,
//     kill: pyshell.end
//   }
// })();

// io.pub('config', { credentials: config.zotero.credentials });

// io.sub(function (msg) {
//   // received a message sent from the Python script (a simple "print" statement)
//   if (msg == 'config') {
//     io.kill(function (err) {
//       if (err) throw err;
//       console.log('finished1');
//     });
//   }
// });


// // backup kill
// io.kill(function (err) {
//   if (err) throw err;
//   console.log('finished2');
// });


// PythonShell.run('zotero.py', {
//   mode: 'text',
//   args: [library_id, library_type, api_key, file]
// }, function (err) {
//   if (err) throw err;
//   console.log('finished');
// });