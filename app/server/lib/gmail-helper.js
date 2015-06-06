var _ = require('lodash');
var Promise = require('bluebird');
var sanitize = require('sanitize-filename');
var escape = require('escape-html');
var events = require('events');
var open = require('open');
var base64 = require('js-base64').Base64;
var LanguageDetect = require('languagedetect');
var cheerio = require('cheerio');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');
var http = require('http');
var urlParser = require('url');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var readline = require('readline');
var Gmail = require('node-gmail-api');

function createClient() {
  return new OAuth2(config.gmail.client, config.gmail.secret, config.gmail.redirect);   
}

function createToken() {
  return new Promise(function (resolve, reject) {
    var oauth2Client = createClient();
    var scope =  'https://www.googleapis.com/auth/gmail.readonly';

    // Generate URL
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
      scope: scope // If you only need one scope you can pass it as string
    });

    // Start interactive mode in console
    var rl =  readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Visit the url: ', url);
    open(url); // open browser window if possible (not working with vagrant :/)

    // start http server for oauth redirect
    var server = http.createServer(function (req, res) {
      var query = urlParser.parse(req.url, true).query;

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('Copy & Paste into Terminal Session: <input value="' + escape(query['code']) + '" style="width: 80%">');
    }).listen(3000);   

    // command line interaction
    rl.question('Enter the code here:', function(code) {
      oauth2Client.getToken(code, function(err, token) {
        oauth2Client.setCredentials(token);
        jf.writeFileSync('config/token.json', token);
        resolve(token);
        rl.close(); // stop interactive mode
        server.close(); // stop http server
      });
    });
  });
}

function getToken() {
    var token = jf.readFileSync('config/token.json');

    if (token && token.expiry_date > new Date().getTime()) // expiration *should* be handled by google #missing
      return new Promise(function (resolve) { resolve(token) });
    else
      return createToken();
}

// e.g. filename($(e).text(), 'pdf');
function filename(string, extension) {
  return sanitize(string).replace(/ /g,"_").substring(0,65).toLowerCase() + '.' + extension;
}

function getItems(keywords) {
  var eventEmitter = new events.EventEmitter;

  getToken()
    .then(function (token) {
      var gmail = new Gmail(token.access_token);

      _.each(keywords, function (keyword) {
        var query = [
              'label:all',
              'from:scholaralerts-noreply@google.com',
              'subject:'+keyword
            ],
            msg = gmail.messages(query.join(' AND '), {max: 100});

          msg
            .on('data', function (d) {
              var body = base64.decode(d.payload.body.data.replace(/-/g, '+').replace(/_/g, '/')), // google-specific (cf. SO)
                $ = cheerio.load(body),
                items = _($('h3>a'))
                  // put in right format
                  .map(function (e) {
                    return {
                      title: $(e).text(),
                      url: e.attribs.href
                    };
                  })
                  // remove unwanted foreign languages
                  .reduce(function (result, item) {
                    var lngDetector = new LanguageDetect(),
                        lng = lngDetector.detect(item.title, 1),
                        c = config.languages;

                    if (_.indexOf(lng[0], c.whitelist) || (!c.excludeOnLowConfidence && confidence < c.confidence)) {
                      result.push(item);
                      return result;
                    }
                    else return result;
                  }, []);

              // emit batches
              eventEmitter.emit('items', items, keyword);

              // emit single items
              _.each(items, function (item) {
                eventEmitter.emit('item', item, keyword);                
              })
            });
      });
    });  

  return eventEmitter;
}

// module API
exports = module.exports = {
  getItems: getItems
}