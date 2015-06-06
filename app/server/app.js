var _ = require('lodash');
var jf = require('jsonfile');

var zotero = require('./lib/zotero-helper');
var gmail = require('./lib/gmail-helper');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections; // collection for incoming files

gmail.getItems(_.keys(collections))
  .on('items', function (items, keyword) {
    console.log(keyword, items);
    // zotero.saveItems(items, collections[keyword]);
  });