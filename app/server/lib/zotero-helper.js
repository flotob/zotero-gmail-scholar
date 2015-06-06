// libs
var _ = require('lodash');
var jf = require('jsonfile');
var crypto = require('crypto');

var zotero = require('zotero'); // https://github.com/inukshuk/zotero-node
var Promise = require('bluebird');
var FormData = require('form-data');

var cheerio = require('cheerio');
var LanguageDetect = require('languagedetect');

// config
var config = jf.readFileSync('config/config.json');
var credentials = config.credentials;

// zotero objects
var client = new zotero.Client;
var lib = new zotero.Library({
      user: credentials.zotero.user,
      key: credentials.zotero.key
    });
// var stream = new zotero.Stream({ apiKey: key });

// templates
var templates = {
  attachment: {
        itemType: 'attachment',

        // parentItem: 'ABCD2345'"',
        linkMode: 'imported_url',
        // contentType: 'application/pdf',
        tags: []
      },
      journalArticle: {
        itemType: 'journalArticle',

        abstractNote: '',
        publicationTitle: '',
        volume: '',
        issue: '',
        pages: '',
        date: '',
        series: '',
        seriesTitle: '',
        seriesText: '',
        journalAbbreviation: '',
        language: '',
        DOI: '',
        ISSN: '',
        shortTitle: '',
        url: '',
        accessDate: '',
        archive: '',
        archiveLocation: '',
        libraryCatalog: '',
        callNumber: '',
        rights: '',
        extra: ''
      }  
};

// config
client.persist = true; // make the client re-use the TCP connection to the server
zotero.promisify(Promise.promisify.bind(Promise)); // make zotero use promises instead of callbacks

/*
*/
function toItems(items, collections) {
  return _.map(items, function (item) {
    return _.extend({}, templates.journalArticle, item, { collections: collections });
  })
}

/*
* Create Virtual Files (itemType=attachment) on Zotero Server
*/
function createFiles (items) {
  return new Promise(function (resolve, reject) {
    // error handling
    if(!_.isArray(items) && _.isObject(items))
      items = [items];
    else if (!_.isArray(items)) {
      reject('createFiles() expects array or object as argument');
      return false;
    }

    client.post('/users/' + credentials.zotero.user + '/items', {key: credentials.zotero.key}, items)
      .then(function (resp) {
        var data = resp.data,
            itemKey;

        if(_.isEmpty(data.success))
          reject(data);
        else
          resolve(data.success);
      })
      .catch(function (err) { 
        reject(err);
      });
  });
}

function saveItems(items, collections) {
  var fn = _.throttle(createFiles, config.zotero.throttle);

  return fn(toItems(items, collections));
}

/*
* Play around
// */
// var file = {
//   // filename: 'doc.pdf',
//   url: 'http://example.com/doc.pdf',
//   title: 'My Document'
// }

// createFiles(_.extend(templates.journalArticle, file))
// // client.get('/itemTypeFields', {itemType: 'journalArticle'})
//   .then(function (itemKey) {
//     console.log('success', itemKey);
//   })
//   .catch(function (err) {
//     console.log('error', err);
//   })

// var form = new FormData()
// form.append('my_field', 'my value');
// form.append('my_buffer', new Buffer(10));
// form.append('my_file', file);
// form.submit('http://api.zotero.org/user/', function(err, res) {
//   // res – response object (http.IncomingMessage)  //
//   res.resume(); // for node-0.10.x
// });

// helpers
function checksum (stream) {
  return new Promise(function (resolve, reject) {
    var hash = crypto.createHash('md5');

    // error
    stream.on('error', function () {
      reject(hash.digest('hex'));
    });

    // update hash
    stream.on('data', function (data) {
        hash.update(data, 'utf8')
    });

    // return hash
    stream.on('end', function () {
      resolve(hash.digest('hex'));
    });
  });
}


// module API
exports = module.exports = {
  saveItems: saveItems
};