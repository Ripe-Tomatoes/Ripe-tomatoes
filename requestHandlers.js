//Handles requests from clients
var parser = require('body-parser');
var querystring = require('querystring');
var utils = require('./utils.js');

//Server request handler
//Exported to: server.js
module.exports = function (app, express){
  var noErrors = true;
  var errorMessage;;
  var errorCode;

  //Parses the client's request
  app.use(parser.json());

  //Handles the client's request.
  //Assumes inputs as req.body.restaurant and req.body.location as strings
  app.post('/search', function (req, res){

    //Formats the search terms into an object. For example, a search query for "sushi" in "san francisco" would result in:
    // var searchTerm = {
    //   term : 'sushi',
    //   location : 'san francisco';
    // };
    var searchTerm = {
      term : req.body.restaurant,
      location : req.body.location
    };
    console.log('searchTerm', searchTerm);

    //This object tracks if all API requests have finished. "tor" means "gate" in German. If an API has finished, the value 
    //for that key becomes the results from the API call.
    var tor = {
      yelp: false,
      foursquare: false
    };

    //Checks if all API's have been loaded. Outputs "true" or "false"
    var allFetchesFinished = function () {
      for (var key in tor) {
        if (!tor[key]) {
          return false;
        }
      }
      return true;
    }

    //Resets errors between all API calls
    var resetErrors = function () {
      noErrors = true;
    }

    //Takes in service name ("yelp" or "foursquare") and submits an request to the given service. If any given API provides 
    //an error, this function will mark the query as having an error. If the API call is successful, it updates the tor 
    //object by changing the value of the service key to the results of the API call.
    //TODO: finish this
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
          res.send({
            error: errorMessage,
            errorCode: errorCode
          });
        } else if (allFetchesFinished()) {
          var results = utils.matchRestaurants(tor.yelp.businesses, tor.foursquare.items);
          if (results.length === 0) {
            res.send({
              error: 'No restaurants found',
              errorCode: 20
            });
          } else {
            res.send({results: results});
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

