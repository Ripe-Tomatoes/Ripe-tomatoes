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
    bodyDir = parsedBody.response.groups[0]
    var rest = new Restaurant(
      bodyDir.items[0].venue.name,
      bodyDir.items[0].venue.location.address,
      bodyDir.items[0].venue.url,
      bodyDir.items[0].venue.location.lat,
      bodyDir.items[0].venue.location.lng,
      'yelpData',
      {rating: bodyDir.items[0].venue.rating,
       url: 'TODO',
       reviewCount: bodyDir.items[0].venue.ratingSignals
      });
    callback(rest);
  })

}

var Restaurant = function(name, address, url, lat, long, yelpData, foursquareData) {
  this.name = name;
  this.address = address;
  this.url = url;
  this.location = {
    latitute: lat,
    longitude: long
  };
  this.yelpData = 'asdf';
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