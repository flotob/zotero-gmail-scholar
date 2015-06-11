var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

queue.process('zotero/create', function(job, done){
  var item = job.data.item;

  zotero.create(item)
    .then(function (id) {
      console.log('parent-id: ', id);
      if (job.data.download) {
        queue.create('zotero/attachment', {
          parent: id,
          files: [ item.url ]
        }).save( function(err){
          if( err ) done(new Error(err));
          else done();
        });      
      }
      else done(); // actually, create job backlog/mimetype -> backlog/crawl(level=n) -> backlog/isPdf -> backlog/mimetype ...
    })
    .catch(function (err) { done(new Error(err)) });
});