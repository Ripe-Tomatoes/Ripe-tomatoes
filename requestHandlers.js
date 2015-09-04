//Handles requests from clients



var parser = require('body-parser');
var querystring = require('querystring');
var apiSearches = require('./utils.js');

module.exports = function (app, express){

  app.use(parser.json());

  app.get('/search', function(req, res){
    console.log('hello');
    var searchTerm = {
      term : req.body.restaurant,
      location : req.body.location
    };



    //handle api calls to yelp/4square
    apiSearches.yelpSearch(searchTerm, function(yelpResults){
      //process api data


      //send back data from api calls
      res.send(yelpResults);
    });
  });

};

