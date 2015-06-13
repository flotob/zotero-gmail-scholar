var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');
var download = require('../lib/download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

console.log("hallo");

queue.process('zotero/create', function(job, done){
  var item = job.data.item;

  console.log("processing job: ", job.id);

  zotero.create(item)
    .then(function (id) {
      if (job.data.download) {

        console.log("create dl job");

        queue.create('zotero/attachment/download', {
          parent: id, // todo: rename to "parent" (cf. zotero_attachment_download.js)
          url: item.url,
          filename: download.filename(item.title, 'pdf')
        }).save( function(err){
          if( err ) done(new Error(err));
          else { 
            console.log("dl job created");
            done();
          }
        });      
      }
      else done(); // actually, create job backlog/mimetype -> backlog/crawl(level=n) -> backlog/isPdf -> backlog/mimetype ...
    })
    .catch(function (err) { done(new Error(err)) });
});