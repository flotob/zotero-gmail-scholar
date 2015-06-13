var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');
var download = require('../lib/download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

queue.process('zotero/attachment/download', function(job, done){
  download.now(job.data.url, job.data.filename, config.cache)
    .then(function (filepath) {
      queue.create('zotero/attachment/upload', {
        parent: job.data.parent, // todo: rename to "parent" (cf. zotero_item_create.js)
        files: [ filepath ]
      }).save( function(err){
        if( err ) done(new Error(err));
        else done();
      });            
    })
    .catch(function (error) {
      done(new Error(error));
    });  
});