var _ = require('lodash');
var jf = require('jsonfile');

var zotero = require('./zotero');
var gmail = require('./gmail');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

var req = gmail.getItems(_.keys(collections));

req.on('items', function (items, keyword) {
  if(process.env['NODE_ENV'] === 'development') {
    console.log('DEBUG', items, keyword);
  }
  else zotero.saveItems(items, collections[keyword])
    .then(function (resp) {
      console.log('success', resp);
    })
    .catch(function (resp) {
      console.log('error', resp);
    });
});