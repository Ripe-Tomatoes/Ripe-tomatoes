//Handles requests from clients



var parser = require('body-parser');
var querystring = require('querystring');
var utils = require('./utils.js');

module.exports = function (app, express){
  var noErrors = true;
  var errorMessage;;
  var errorCode;

  app.use(parser.json());

  app.post('/search', function (req, res){
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
        if (!tor[key]) {
          return false;
        }
      }
      return true;
    }

    var resetErrors = function () {
      noErrors = true;
    }

    //takes in organization name as input ("yelp" or "foursquare") and does the API search, sending a response if all API's are loaded. . .
    var apiSearch = function (org) {
      utils[org + 'Search'](searchTerm, function(result){
        tor[org] = result;
        if (result.error_code === 50) {
          console.log('error caught');
          noErrors = false;
          errorMessage = result.error;
          errorCode = result.error_code;
        }
        if (!noErrors) {
          res.end('Error code ' + errorCode + ': ' + errorMessage);
        } else 
        //process api data
        if (allFetchesFinished()) {
          var results = utils.matchRestaurants(tor.yelp.businesses, tor.foursquare.items);
          if (results.length === 0) {
            res.end('No restaurants found');
          } else {
            res.send(results);
          }
        }
      });
    };

    apiSearch('yelp');
    resetErrors();
    apiSearch('foursquare');

    // handle api calls to yelp/4square
    // utils.yelpSearch(searchTerm, function(yelpResults){
    //   tor.yelp = yelpResults;
    //   //process api data
    //   if (allFetchesFinished()) {
    //     var results = utils.matchRestaurants(tor.yelp.businesses, tor.foursquare.items);
    //     console.log(results);
    //     res.send(results);
    //   }
    // });

    // utils.foursquareSearch(searchTerm, function(foursquareResults){
    //   tor.foursquare = foursquareResults;
    //   // send back data from api calls
    //   if (allFetchesFinished()) {
    //     var results = utils.matchRestaurants(tor.yelp.businesses, tor.foursquare.items);
    //     console.log(results);
    //     res.send(results);
    //   }
    // });
  });

};

