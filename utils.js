//API search functions

var apiKeys = require('./apiKeys.js');
var request = require("request");
var yelp = require("yelp").createClient(apiKeys.yelpKeys());

module.exports.yelpSearch = function (searchTerm, callback){
  var results = yelp.search(searchTerm, function(err, data){
    callback(data);
  });
};

module.exports.foursquareSearch = function (searchTerm, callback) {
  //this is the query string to be passed into foursquare's server
  var queryString = 
    'https://api.foursquare.com/v2/venues/explore?client_id=' 
    + apiKeys.foursquareKeys().client_ID + 
    '&client_secret=' + apiKeys.foursquareKeys().client_secret + 
    '&v=20130815&' +
    'near=' + searchTerm.location +
    '&query=' + searchTerm.term;
  request(queryString, function (error, response, body) {
    if (error) {
      throw error;
    }
    parsedBody = JSON.parse(body);
    console.log(parsedBody);
    if (parsedBody.meta.code === 400) {
      if (parsedBody.meta.errorType === 'failed_geocode') {
        console.log('no geography that matches user inquiry found');
        callback({error: 'no geography that matches user inquiry found',
                  error_code: 50})
      }
    } else if (parsedBody.meta.code === 500) {
      console.log('foursquare server');
    } else {
      bodyDir = parsedBody.response.groups[0]
      callback(bodyDir);
    }


  })
}

module.exports.matchRestaurants = function (yelpArray, foursquareArray) {
  var matchedRestaurants = [];

  function removeCommonWords (string) {
    var ignoreWords = ["restaurant", "cuisine"];
    var cleanedString = string;
    
    // for each word in ignore list, remove  any instances of that from the string
    ignoreWords.forEach( function(word){
      var regex = new RegExp( word, 'gi');
      cleanedString = cleanedString.replace(regex, "");
    });
    
    // removes duplicate spaces
    return cleanedString.replace( /\s+/, " ").trim();
  };

  function extractAddressNumber (string) {
    return string !== undefined ? string.match(/\d*\b/)[0] : null;
  };
  
  for (var restaurantsq = 0; restaurantsq < foursquareArray.length; restaurantsq++) {
    for (var restauranty = 0; restauranty < yelpArray.length; restauranty++){
      // if (extractAddressNumber(yelpArray[restauranty].location.address[0]) === extractAddressNumber(foursquareArray[restaurantsq].venue.location.address)) {
      //   console.log(removeCommonWords(foursquareArray[restaurantsq].venue.name).length, removeCommonWords(yelpArray[restauranty].name).length);
      // };
      if (removeCommonWords(foursquareArray[restaurantsq].venue.name) === removeCommonWords(yelpArray[restauranty].name) &&
          extractAddressNumber(foursquareArray[restaurantsq].venue.location.address) === extractAddressNumber(yelpArray[restauranty].location.address[0])) {
  
        var rest = new Restaurant(
          foursquareArray[restaurantsq].venue.name,
          //
          yelpArray[restauranty].location.address[0],
          foursquareArray[restaurantsq].venue.url,
          foursquareArray[restaurantsq].venue.location.lat,
          foursquareArray[restaurantsq].venue.location.lng,
          {
            rating: yelpArray[restauranty].rating,
            ratingUrl: yelpArray[restauranty].rating_img_url,
            url: yelpArray[restauranty].url,
            reviewCount: yelpArray[restauranty].review_count
          },
          {
            rating: foursquareArray[restaurantsq].venue.rating,
            ratingColor: foursquareArray[restaurantsq].venue.ratingColor,
            url: createFoursquareURL(foursquareArray[restaurantsq].venue.id, foursquareArray[restaurantsq].venue.name),
            reviewCount: foursquareArray[restaurantsq].venue.ratingSignals
          });
        matchedRestaurants.push(rest);
      }
    }
  }
  return matchedRestaurants;
}

var createFoursquareURL = function (venueID, venueName) {
  var url = 'https://foursquare.com/v/';
  for (var index = 0; index < venueName.length; index++) {
    if (venueName[index] === ' ') {
      url += '-';
    } else {
      url += venueName[index]
    }
  };
  url += '/' + venueID + '?ref=' + apiKeys.foursquareKeys().client_ID;
  return url;
}

var Restaurant = function (name, address, url, lat, long, yelpData, foursquareData) {
  this.name = name;
  this.address = address;
  this.url = url;
  this.location = {
    latitute: lat,
    longitude: long
  };
  this.yelpData = yelpData;
  // {
  //   rating: 4,
  //   ratingUrl: 'https://www.yelp.com/image',
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