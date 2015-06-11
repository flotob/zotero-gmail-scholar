var _ = require('lodash');
var kue = require('kue')
  , queue = kue.createQueue();

var states = ['active', 'complete', 'failed', 'delayed'];

_.each(states, function (state) {
  queue[state]( function( err, ids ) {
    ids.forEach( function( id ) {
      kue.Job.get( id, function( err, job ) {
        // Your application should check if job is a stuck one
        job.inactive();
      });
    });
  });
});

