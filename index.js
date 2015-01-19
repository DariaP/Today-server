
function start() {
  var express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      markdown = require( "markdown" ).markdown,
      cheerio = require('cheerio'),
      Gisty = require('gisty');

  var app = express(),
      gist = new Gisty();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.get('/days', function (req, res) {
    gist.fetch('20e75a8190338287139a', function(error, gist) {
      if (error) {
        ;
      } else {
        for (filename in gist.files) {
          var records = [],
              html = markdown.toHTML( gist.files[filename].content ),
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
          res.send(records);
        }
      }
    });
  });

  app.post('/days', function (req, res) {
    console.log(req.body);
  });

  app.listen(8089);
}

start();
