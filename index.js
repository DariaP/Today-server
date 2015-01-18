var config = require('./config.js');
 
function start() {
  var express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser');

  var app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.get('/days', function (req, res) {
    res.send([
    {
      date: "1/17/2015",
      done:"something",
      diff:"nothing"
    },
    {
      date: "1/18/2015",
      done:"something more",
      diff:"everything"
    }]);
  });

  app.post('/days', function (req, res) {
    console.log(req.body);
  });

  app.listen(8089);
}

start();
