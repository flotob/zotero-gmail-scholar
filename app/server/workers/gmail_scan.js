var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');
var gmail = require('../lib/gmail');
var download = require('../lib/download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

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

    var job = queue.create('zotero/create', {
      item: item,
      download: pdf ? true : false
    }).save( function(err){
      if( !err ) console.log('error on creation of job: ', job );
      else console.log('created job: ', job);
    });
  });