module.exports = function (url) {
  // var _ = require('lodash');
  // var Promise = require('bluebird');
  var Crawler = require("simplecrawler");
  var crawler = new Crawler(url);

  // configure crawler
  // crawler.interval = '1000';
  // crawler.maxConcurrency = 1;
  // crawler.maxDepth = 1;

  // add fetch conditions (=filters)
  // var filters = {
  //   'pdf': crawler.addFetchCondition(function(parsedURL) {
  //     return parsedURL.path.match(/\.pdf$/i);
  //   })
  // };

  // register listeners
  crawler
    // .on('fetchredirect', function (q, parsedURL, response) {
    //   console.log("fetchredirect", arguments);
    // })
    // .on('fetchheaders', function (q, response) {
    //   console.log("fetchheaders", arguments);
    // })
    .on('queueadd    ', function (q, responseBuffer, response) {
      console.log("queueadd", q);
    })    
    // .on('fetchcomplete', function (q, responseBuffer, response) {
    //   console.log("fetchcomplete", arguments);
    // })
    // .on('discoverycomplete', function (q, responseBuffer, response) {
    //   console.log("discoverycomplete", arguments);
    // })
    // .on('complete', function (q, responseBuffer, response) {
    //   console.log("complete", arguments);
    // });    

  // start crawling
  crawler.start();
}