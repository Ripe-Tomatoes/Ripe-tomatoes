var yelp = require("yelp").createClient({
  consumer_key: "ZJ04kC70PhVlktFnTYDwBQ", 
  consumer_secret: "TcZ6jMoGNNuaPgYaiuVATEgWsN4",
  token: "-awaXhCaBNTCwq1cDJDx5EIPzHHZQw_O",
  token_secret: "SrdK7N9wz5dWExX-HsVEYL3yzuk"
});
 
// See http://www.yelp.com/developers/documentation/v2/search_api 


var express = require('express');
var querystring = require('querystring');
var app = express();

// http://127.0.0.1:3000/?firstname=Restaurant&lastname=Location
// {"searchTerm":"Restaurant","location":"Location"}
app.get('/*', function (req, res) {
  var search = req.query;
  var results = yelp.search({term: search.searchTerm, location: search.location}, function(error, data, callback) {
      res.send(data);
    if(error){
      console.log("Error", error);
    }
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});