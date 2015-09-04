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

    //***this is a temp placeholder data
    // var searchTerm = {
    //   term : 'sushi',
    //   location : 'san francisco';
    // };



    // handle api calls to yelp/4square
    apiSearches.yelpSearch(searchTerm, function(yelpResults){
      console.log('this is yelp', yelpResults);
      //process api data
      apiSearches.foursquareSearch(searchTerm, function(foursquareResults){
        console.log(foursquareResults);
        // send back data from api calls
        res.send(yelpResults);
      })
    });
  });

};

