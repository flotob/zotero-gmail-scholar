var _ = require('lodash');
var zotero = require('./lib/zotero-helper');
var gmail = require('./lib/gmail-helper');

gmail.getArticles(['bitcoin', 'blockchain'])
  // .on('items', function (items, keyword) {
  //   console.log(keyword, _.map(items, function (item) { return item.title }));
  // });
.on('item', function (item, keyword) {
    console.log(keyword, item.title);
  });