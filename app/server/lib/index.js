var _ = require('lodash');
var jf = require('jsonfile');
var url = require('url');
var query = require('querystring');

var zotero = require('./zotero');
var gmail = require('./gmail');

var config = jf.readFileSync('config/config.json');
var collections = config.zotero.collections;

var urls = [
  'http://scholar.google.de/scholar_url?url=http://dl.acm.org/citation.cfm%3Fid%3D2732196&hl=de&sa=X&scisig=AAGBfm329RZL2VLmIFMF7Dy_scYMZrXf8g&nossl=1&oi=scholaralrt',
  'http://dl.acm.org/citation.cfm%3Fid%3D2732196&hl=de&sa=X&scisig=AAGBfm329RZL2VLmIFMF7Dy_scYMZrXf8g&nossl=1&oi=scholaralrt',
  'http://scholar.google.de/scholar_url?url=http://object.cato.org/sites/cato.org/files/serials/files/cato-journal/2015/5/cj-v35n2-12.pdf&hl=de&sa=X&scisig=AAGBfm0GfMhAraE_Z3HoKdGWjE0HouVYxQ&nossl=1&oi=scholaralrt'
];

// IMPORTANT THIS IS IT!! query.parse( url.parse( the_url ).query ).url

// var Crawler = require("simplecrawler");

// Crawler.crawl(unescape(url[2]))
//   .on("queueadd", function(q){
//     var url = 

//     console.log(q.url)

//     if (q.url.match(/\.pdf$/i)) {
//       console.log(q.url);
//     }
//     if(q.depth === 3) this.stop();
//   })
  // .on("fetchcomplete", function(queueItem){
  //    console.log("Completed fetching resource:", queueItem.url);
  // });

// var req = gmail.getItems(_.keys(collections));

// req.on('items', function (items, keyword) {
//   if(process.env['NODE_ENV'] === 'development') {
//     console.log('DEBUG', items, keyword);
//   }
  // else zotero.saveItems(items, collections[keyword])
  //   .then(function (resp) {
  //     console.log('success', resp);
  //   })
  //   .catch(function (resp) {
  //     console.log('error', resp);
  //   });
// });