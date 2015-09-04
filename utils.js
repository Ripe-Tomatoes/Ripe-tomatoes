//API search functions

var apiKeys = require('./apiKeys.js');
var yelp = require("yelp").createClient(apiKeys.yelpKeys());

module.exports.yelpSearch = function(searchTerm, callback){
  var results = yelp.search(searchTerm, function(err, data){
    callback(data);
  });
};