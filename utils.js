//API search functions

var apiKeys = require('./apiKeys.js');
var request = require("request");
var yelp = require("yelp").createClient(apiKeys.yelpKeys());

module.exports.yelpSearch = function(searchTerm, callback){
  var results = yelp.search(searchTerm, function(err, data){
    callback(data);
  });
};

module.exports.foursquareSearch = function(searchTerm, callback) {
  //this is the query string to be passed into foursquare's server
  var queryString = 
    'https://api.foursquare.com/v2/venues/explore?client_id=' 
    + apiKeys.foursquareKeys().client_ID + 
    '&client_secret=' + apiKeys.foursquareKeys().client_secret + 
    '&v=20130815&' +
    'near=' + searchTerm.location +
    '&query=' + searchTerm.term;

    request(queryString, function(error, response, body) {
      if (error) {
        throw error;
      }
      parsedBody = JSON.parse(body);
      if (parsedBody.meta.code === 500) {
        console.log('foursquare server');
      } else {
        bodyDir = parsedBody.response.groups[0]
        callback(bodyDir);
      }


    })
}

module.exports.matchRestaurants = function(yelpArray, foursquareArray) {
  var matchedRestaurants = [];
  for (var restaurantsq = 0; restaurantsq < foursquareArray.length; restaurantsq++) {
    for (var restauranty = 0; restauranty < yelpArray.length; restauranty++){
      if (foursquareArray[restaurantsq].venue.name === yelpArray[restauranty].name) {
        var rest = new Restaurant(
          foursquareArray[restaurantsq].venue.name,
          foursquareArray[restaurantsq].venue.location.address,
          foursquareArray[restaurantsq].venue.url,
          foursquareArray[restaurantsq].venue.location.lat,
          foursquareArray[restaurantsq].venue.location.lng,
          {
            rating: yelpArray[restauranty].rating_img_url,
            url: yelpArray[restauranty].url,
            reviewCount: yelpArray[restauranty].review_count
          },
          {
            rating: foursquareArray[restaurantsq].venue.rating,
            url: 'TODO',
            reviewCount: foursquareArray[restaurantsq].venue.ratingSignals
          });
        matchedRestaurants.push(rest);
      }
    }
  }
  return matchedRestaurants;
}

var Restaurant = function(name, address, url, lat, long, yelpData, foursquareData) {
  this.name = name;
  this.address = address;
  this.url = url;
  this.location = {
    latitute: lat,
    longitude: long
  };
  this.yelpData = yelpData;
  // {
  //   yelpRatingImage: 'https://www.yelp.com/image',
  //   url: 'https://www.yelp.com',
  //   reviewCount: 123
  // }
  this.foursquareData = foursquareData;
  // {
  //   rating: 9.8,
  //   url: 'https://www.foursquare.com',
  //   reviewCount: 23
  // },
  this.compositeScore = 'TODO';
}