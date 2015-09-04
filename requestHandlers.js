//Handles requests from clients



var parser = require('body-parser');
var querystring = require('querystring');
var apiSearches = require('./utils.js');

module.exports = function (app, express){

  app.use(parser.json());

  app.post('/search', function(req, res){
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

    console.log('searchTerm', searchTerm);

    //"tor" means "gate" in German
    var tor = {
      yelp: false,
      foursquare: false
    };

    //checks if all API's have been loaded
    var allFetchesFinished = function () {
      for (var key in tor) {
        console.log('key ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', key);
        if (!tor[key]) {
          return false;
        }
      }
      return true;
    }

    var resetTor = function () {
      for (var key in tor) {
        tor[key] = false;
      }
    }

    // handle api calls to yelp/4square
    apiSearches.yelpSearch(searchTerm, function(yelpResults){
      tor.yelp = yelpResults;
      //process api data
      if (allFetchesFinished()) {
        res.send(tor);
        resetTor();
      }
    });

    apiSearches.foursquareSearch(searchTerm, function(foursquareResults){
      tor.foursquare = foursquareResults;
      // send back data from api calls
      if (allFetchesFinished()) {
        res.send(tor);
        resetTor();
      }
    });
  });

};

