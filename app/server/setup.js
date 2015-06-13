var gmail = require('./lib/gmail');

gmail.getToken()
  .then(function (token) {
    console.log(token);
    console.log('successfully written to file');
    console.log('exiting');
    process.exit(0);
  });