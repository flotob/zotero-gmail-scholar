var _ = require('lodash');
var Promise = require('bluebird');
var sanitize = require('sanitize-filename');
var open = require('open');
var base64 = require('js-base64').Base64;
var LanguageDetect = require('languagedetect');
var cheerio = require('cheerio');
var jf = require('jsonfile');
var config = jf.readFileSync('config/config.json');

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
    open(url); // open browser window if possible
    rl.question('Enter the code here:', function(code) {
      oauth2Client.getToken(code, function(err, token) {
        oauth2Client.setCredentials(token);
        jf.writeFileSync('config/token.json', token);
        resolve(token);
        rl.close(); // stop interactive mode
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

function getArticles() {
  return new Promise(function (resolve, reject) {
    getToken()
      .then(function (token) {
        var gmail = new Gmail(token.access_token)
          , msg = gmail.messages('label:all and from:scholaralerts-noreply@google.com and subject: bitcoin', {max: 1});

        msg
          .on('data', function (d) {
            var body = base64.decode(d.payload.body.data.replace(/-/g, '+').replace(/_/g, '/')),
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

            resolve(items);
          });
      });      
  });
}

// module API
exports = module.exports = {
  getArticles: getArticles
}