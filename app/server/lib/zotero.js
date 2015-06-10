var _ = require('lodash');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var PythonShell = require('python-shell');

// items: [{
//   itemType: 'journalArticle',
//   title: 'hallo123testeinszwo',
//   url: 'http://example.org',
//   files: []

function create (items) {
  items = _.isArray(items) ? items : [items];

  var py = new PythonShell('zotero.py', {
    scriptPath: './lib',
    pythonOptions: ['-u'],
    mode: 'text',
  });

  // register listener
  py.on('message', function (resp) {
    resp = JSON.parse( resp.replace(/u'(?=[^:]+')/g, "'") ); // cf. http://stackoverflow.com/a/21319120/899586
    console.log(resp);
  });    

  // request
  request('create', {
    auth: config.zotero.credentials,
    items: items
  });

  // end the input stream and allow the process to exit
  py.end(function (err) {
    if (err) throw err;
    console.log('python script halted');
  });  
}

function request (subject, body) {
  py.send(JSON.stringify(_.extend(body, { subject:subject })));
}

module.exports = {
  create: create
}