
function start() {

  var secret = process.env.GITHUB_CLIENT_SECRET;

  var cors = require('cors'),
      bodyParser = require('body-parser'),
      markdown = require( "markdown" ).markdown,
      cheerio = require('cheerio'),
      app = require('express')(),
      oauth2 = require('simple-oauth2')({
        clientID: '629d6f58d67ac0082a37',
        clientSecret: secret,
        site: 'https://github.com/login',
        tokenPath: '/oauth/access_token'
      }),
      GitHubApi = require("github");

  var github = new GitHubApi({
    version: "3.0.0",
  });

  var gistIds = {};

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.get('/days', function (req, res) {
    getGist(
      req.query.code, 
      function(content) {
        parseGist(content, function(records) {
          res.send(records);
        });
      }
    );
  });

  app.post('/days', function (req, res) {
    getGist(
      req.query.code, 
      function(content) {
        var newContent = content + makeTodayRecord(req.body),
            id = gistIds[req.query.code];

        github.gists.edit(
          {
              id: id,
              files: {
                  "todayAppTest.txt": {
                      "content": newContent
                  }
              }
          },
          function(err, res) {
            ;
          }
        );
      }
    );
  });

  function getGist(code, callback) {
    if (!gistIds[code]) {
      authorize(code, function() {
        // todo - save github instance
        github.gists.getAll({}, function(err, gists) {
          findGistId(gists, function(id) {
            gistIds[code] = id;
            readGist(id, function(data) {
              callback(data);
            });
          });
        });
      });
    } else {
      var id = gistIds[code];
      readGist(id, function(data) {
        callback(data);
      });
    }
  }

  function authorize(code, callback) {
    oauth2.authCode.getToken({
        code: code,
        redirect_uri: 'http:///localhost:8000/today.html'
      }, 
      function(error, result) {
        if (error) { console.log('Access Token Error', error.message); }
        var token = result.substring(result.indexOf("=") + 1, result.indexOf("&"));

        github.authenticate({
          type: "oauth",
          token: token
        });

        callback();
      }
    );
  }

  function findGistId(gists, callback) {
    for (var i = 0 ; i < gists.length ; ++i) {
      var gist = gists[i];
      if (gist.files['todayAppTest.txt']) {
        callback(gist.id);
      }
    }
  };

  function readGist(id, callback) {
    github.gists.get({id: id}, function (err, gist) {
      callback(gist.files['todayAppTest.txt'].content);
    });
  }

  function parseGist(gist, callback) {
    var records = [],
        html = markdown.toHTML(gist),
        $ = cheerio.load(html),
        dates = $('h1');

    dates.each(function(i) {
      var date = $(this),
          done = date.next().next(),
          diff = done.next().next();

      records.push({
        date: date.text(),
        done: done.text(),
        diff: diff.text()
      });
    });
    callback(records);
  }

  function makeTodayRecord(data) {
    return "\n \n# " + data.date +
           "\n## what have I learned today?\n" +
           data.done + 
           "\n \n## what would I do differently?\n" +
           data.diff;
  }

  app.listen(8089);
}

start();
