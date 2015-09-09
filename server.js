// var apiKeys = require('./apiKeys.js');
// var yelp = require("yelp").createClient(apiKeys.yelpKeys);
var requestHandlers = require('./requestHandlers');

var parser = require('body-parser');

// See http://www.yelp.com/developers/documentation/v2/search_api

var express = require('express');
var querystring = require('querystring');
var app = express();
app.use(express.static(__dirname + '/client'));
// http://127.0.0.1:3000/?firstname=Restaurant&lastname=Location
// {"searchTerm":"Restaurant","location":"Location"}
// app.use(parser.json());

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
  console.log('Example app listening at http://%s', port);
});

requestHandlers(app, express);


