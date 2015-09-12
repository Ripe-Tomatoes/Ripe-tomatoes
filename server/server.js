// var apiKeys = require('./apiKeys.js');
// var yelp = require("yelp").createClient(apiKeys.yelpKeys);
var requestHandlers = require('./config/requestHandlers');

var express = require('express'),
    querystring = require('querystring'),
    mongoose    = require('mongoose');
    uriUtil = require('mongodb-uri');

// See http://www.yelp.com/developers/documentation/v2/search_api

var app = express();

var mongoURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017";
var mongooseUri = uriUtil.formatMongoose(mongoURI);
var MongoDB = mongoose.connect(mongooseUri).connection;
MongoDB.on('error', console.error.bind(console, 'connection error: database'));
MongoDB.once('open', function() {
  console.log("mongodb connection open");
});

app.use(express.static(__dirname + '/../client'));
// http://127.0.0.1:3000/?firstname=Restaurant&lastname=Location
// {"searchTerm":"Restaurant","location":"Location"}
// app.use(parser.json());

var server = app.listen( (process.env.PORT || 3000), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

requestHandlers(app, express);
