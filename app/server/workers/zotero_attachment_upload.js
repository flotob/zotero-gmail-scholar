var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');
var download = require('../lib/download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

queue.process('zotero/attachment', function(job, done){
  download.now(job.data.files)
    .then(function (filepath) {
      _.extend(item, {files: [filepath]});
      console.log('calling create on: ', item);
      zotero.create([item], { delCachedFile: true })
        .then(function (logs) {
          console.log('zot-create-promsie (withfile): success', logs);
        })
        .catch(function (err) {
          console.log('zot-create-promise (withfile): error', err);
        });
    })
    .catch(function (error) {
      console.log('download error', error);
      zotero.create([item])
        .then(function (logs) {
          console.log('zot-create-promsie (nofile): success', logs);
        })
        .catch(function (err) {
          console.log('zot-create-promsie (nofile): success', err);
        });          
    });  
});