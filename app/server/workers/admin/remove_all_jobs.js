var _ = require('lodash');
var kue = require('kue')
  , queue = kue.createQueue();

var states = ['active', 'inactive', 'complete', 'failed', 'delayed'];

_.each(states, function (state) {
  queue[state]( function( err, ids ) {
    ids.forEach( function( id ) {
      kue.Job.get( id, function( err, job ) {
        job.remove();
      });
    });
  });
});

