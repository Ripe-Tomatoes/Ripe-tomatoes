//Handles requests from clients
var parser  = require('body-parser'),
    utils   = require('./utils.js'),
    userController = require('../users/userController.js');

//Server request handler
//Exported to: server.js
module.exports = function (app, express){
  //These error messages are placeholders for if there are any errors for any given API request.
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
    };

    //Resets errors between all API calls
    var resetErrors = function () {
      noErrors = true;
    };

    //Takes in service name ("yelp" or "foursquare") and submits an request to the given service. If any given API provides 
    //an error, this function will mark the query as having an error. If the API call is successful, it updates the tor 
    //object by changing the value of the service key to the results of the API call.

    //Note that the API searches are done ASYNC and are done concurrently to minimize the time it takes to fetch the API.
    //Thus, 3 API calls that take 300ms, 200ms, and 150ms individually would only need 300ms to complete and not 650ms.
    //This is why the tor object is necessary, as it is a persistant check to see if all API fetches are complete before
    //sending back any data. 

    //Note that this function is called for every single API
    //TODO: finish this
    var apiSearch = function (API) {
      utils[API + 'Search'](searchTerm, function (result){
        tor[API] = result;

        //handles error_code 50, which means the user's inputted location could not be found.
        if (result.error_code === 50) {
          console.log('error caught');
          noErrors = false;
          errorMessage = result.error;
          errorCode = result.error_code;
        }

        //If there was an error in the request, send error message to client in the form of an object:
        // { error: 'errorMessage as a string',
        //   errorCode: integer}
        if (!noErrors) {
          res.send({
            error: errorMessage,
            errorCode: errorCode
          });

        //Otherwise, if all API fetches are complete, run the utils.matchRestaurants function to match up all the results
        //across all of the API fetches. Any additional APIs would need to be added into the matchRestaurants function
        } else if (allFetchesFinished()) {
          var results = utils.matchRestaurants(tor.yelp.businesses, tor.foursquare.items);
          
          //If no matches between the arrays are found, or the arrays are empty, return errorCode 20: No restaurants found
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

    //Errors reset is necessary to ensure that TODO FINISH THIS
    //check if this is better placed at the end of apiSearch()
    resetErrors();
    apiSearch('foursquare');
  });

  // app.post('/signin', );

  app.post('/signup', userController.signup);
  app.post('/signin', userController.signin);

  app.post('/user/:name', function (req, res) {
    if (req.body.op === 'add') {
      userController.addFavorite(req, res);
    } else if (req.body.op === 'retrieve') {
      userController.retrieveFavorites(req, res);
    } else if (req.body.op === 'remove') {
      userController.removeFromFavorites(req, res);
    }
  });

  app.post('/check', function (req, res) {
    userController.checkAuth(req, res);
  });
};

