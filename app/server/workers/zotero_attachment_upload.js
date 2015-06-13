var _ = require('lodash');
var jf = require('jsonfile');
var path = require('path');

var kue = require('kue')
  , queue = kue.createQueue();

var zotero = require('../lib/zotero');
var download = require('../lib/download');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

queue.process('zotero/attachment/upload', function(job, done){
  zotero.upload(job.data)
    .then(function () { done(); })
    .catch(function (err) { done(new Error(err)); });
});