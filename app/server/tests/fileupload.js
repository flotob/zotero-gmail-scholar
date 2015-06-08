var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');
var pyshell = new PythonShell('zotero.py', {
  scriptPath: './lib',
  pythonOptions: ['-u'],
  mode: 'text',
});

function send (subject, body) {
  pyshell.send(JSON.stringify(_.extend(body, { subject:subject })));
}

send('auth', config.zotero.credentials ); 
send('create', {
  // auth: config.zotero.credentials,
  items: [{
    itemType: 'journalArticle',
    title: 'hallo123testeinszwo',
    url: 'http://example.org',
    files: ['/ripple.pdf']
  }]
});

pyshell.on('message', function (resp) {
  resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
  console.log(resp);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
  if (err) throw err;
  console.log('python script halted');
});