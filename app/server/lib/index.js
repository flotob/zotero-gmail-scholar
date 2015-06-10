var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var zotero = require('./zotero');
var gmail = require('./gmail');
var download = require('./download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

var root = path.dirname(require.main.filename);

gmail.getItems(_.keys(collections))
  .on('item', function (item, keyword) {
    var clean_url = download.cleanURL(item.url);
    var pdf = download.isPDF(clean_url);

    // set zotero template type, assume we're dealing with articles bc of google scholar
    _.extend(item, { 
      itemType: config.zotero.template,
      collections: collections[keyword],
      url: clean_url
    });    

    // extend item with cached file
    if (pdf) {
      var file = download.filename(item.title, 'pdf');
      download.now(pdf, file)
        .then(function (filepath) {
          _.extend(item, {files: [filepath]});
          console.log('calling create on: ', item);
          zotero.create([item], { delCachedFile: true })
            .then(function (logs) {
              console.log('zot-create-promsie: success', logs);
            })
            .catch(function (err) {
              console.log('zot-create-promise: error', err);
            });
        });
    }
    else {
      zotero.create([item])
        .then(function (logs) {
          console.log('success', logs);
        })
        .catch(function (err) {
          console.log('error', err);
        });
    }
  });