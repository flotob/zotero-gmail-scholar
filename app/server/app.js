var zotero = require('./lib/zotero-helper');
var gmail = require('./lib/gmail-helper');

gmail.getArticles(['bitcoin', 'blockchain'])
  .then(function (articles) {
    // zotero.saveArticles(articles);
    console.log(articles);
  });