//API search functions

var apiKeys = require('../../apiKeys.js');
var request = require("request");
var yelp = require("yelp").createClient(apiKeys.yelpKeys());

//Yelp search function. Done via a yelp JS wrapper function
module.exports.yelpSearch = function (searchTerm, callback){
  var results = yelp.search(searchTerm, function(err, data){
    if (err){
      callback({error: 'no geography that matches user inquiry found',
                error_code: 50});
    } else {
      callback(data);
    }
  });
};

//Foursquare API search
module.exports.foursquareSearch = function (searchTerm, callback) {
  //this is the query string to be passed into foursquare's server
  var queryString = 
    'https://api.foursquare.com/v2/venues/explore?' +
    'client_id=' + apiKeys.foursquareKeys().client_ID + 
    '&client_secret=' + apiKeys.foursquareKeys().client_secret + 
    '&v=20130815&' +
    'near=' + searchTerm.location +
    '&query=' + searchTerm.term;
  request(queryString, function (error, response, body) {
    if (error) {
      throw error;
    }
    var parsedBody = JSON.parse(body);
    // console.log(parsedBody);
    
    //If foursquare gives an error 400, and says "failed geocode", it basically means that it can't
    //find the location that it was passed. If so, this function sends back an object with error
    if (parsedBody.meta.code === 400) {
      if (parsedBody.meta.errorType === 'failed_geocode') {
        console.log('no geography that matches user inquiry found');

        //This is the object sent back if there is an error
        callback({error: 'no geography that matches user inquiry found',
                  error_code: 50})
      }

    //the 500 code error from foursquare is rare and it was happening randomly one day. Rarely hits nowadays
    } else if (parsedBody.meta.code === 500) {
      console.log('foursquare server error');
    } else {
      bodyDir = parsedBody.response.groups[0]
      callback(bodyDir);
    }
  })
}

//This function finds the coordinates of a location via Google Map API. No longer used
var findCoord = function (location, callback) {
  var queryString = 
    'https://maps.googleapis.com/maps/api/geocode/json?' + 
    'address=' + location +
    '&key='+ apiKeys.googleKeys().mapKey;
  request(queryString, function (error, response, body) {
    if (error) {
      throw error;
    }
    var parsedBody = JSON.parse(body);
    // console.log(parsedBody);
    callback(parsedBody);
  })
}

//This is old code--no longer used. 
//This function does a googleLocation search, similar to the foursquare and yelp searches
module.exports.googleSearch = function (searchTerm, callback) {
  findCoord(searchTerm.location, function(res) {
    if (res.status === 'ZERO_RESULTS') {
      console.log('no geography that matches user inquiry found');
      callback({error: 'no geography that matches user inquiry found',
                error_code: 50})
    } else {
      var location = res.results[0].geometry.location;
      var radius = Math.min((res.results[0].geometry.viewport.northeast.lat -
        res.results[0].geometry.viewport.southwest.lat) * 110000, 50000);
      console.log(radius);
      var queryString = 
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
        'key=' + apiKeys.googleKeys().mapKey +
        '&location=' + location.lat + ',' + location.lng +
        '&name=' + searchTerm.term +
        '&radius=' + radius;
        console.log(queryString);
      request(queryString, function (error, response, body) {
        var parsedBody = JSON.parse(body);
        var results = parsedBody.results;
        if (parsedBody.next_page_token) {
          request(queryString + '&pagetoken=' + parsedBody.next_page_token, function (error, response, body) {
            var parsedBody = JSON.parse(body);
            for (var i = 0; i < parsedBody.results.length; i++) {
              results.push(parsedBody.results[i]);
            }
            console.log(results);
            callback(results);
          })
        } else {
          callback(results);
        }
      })
    }
  })
}

//This massive function takes the restaurants that have been found so far and then matches them, combining them into 
//one array called matchedRestaurants that is an array of Restaurants objects 
module.exports.matchRestaurants = function (yelpArray, foursquareArray, callback) {
  var matchedRestaurants = [];

  //Helper function to help remove certain common words, as defined in the ignoreWords array.
  function removeCommonWords (string) {

    //Feel free to add words onto here as you feel is needed
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

  //Helper function to help extract addressnumbers from addresses. Used to compare restaurants
  function extractAddressNumber (string) {
    return string !== undefined ? string.match(/\d*\b/)[0] : null;
  };
  
  for (var restaurantsq = 0; restaurantsq < foursquareArray.length; restaurantsq++) {
    for (var restauranty = 0; restauranty < yelpArray.length; restauranty++){
      // if (extractAddressNumber(yelpArray[restauranty].location.address[0]) === extractAddressNumber(foursquareArray[restaurantsq].venue.location.address)) {
      //   console.log(removeCommonWords(foursquareArray[restaurantsq].venue.name).length, removeCommonWords(yelpArray[restauranty].name).length);
      // };
      
      //This next line checks if the venues have the similar names, and if they have the same street number
      if (removeCommonWords(foursquareArray[restaurantsq].venue.name) === removeCommonWords(yelpArray[restauranty].name) &&
          extractAddressNumber(foursquareArray[restaurantsq].venue.location.address) === extractAddressNumber(yelpArray[restauranty].location.address[0])) {
  
        //if they are the same, create a new restaurant and add it into the matchedRestaurants array
        var rest = new Restaurant(
          foursquareArray[restaurantsq].venue.name,
          // changed below to pull from yelp's location.display_address property instead of the location.address[0]
          // yelpArray[restauranty].location.address[0],
          yelpArray[restauranty].location.display_address,
          foursquareArray[restaurantsq].venue.url,
          foursquareArray[restaurantsq].venue.location.lat,
          foursquareArray[restaurantsq].venue.location.lng,
          
          // yelpArray[restauranty].display_phone
          yelpArray[restauranty].display_phone,
          yelpArray[restauranty].image_url,
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
          }
          );
        matchedRestaurants.push(rest);
      }
    }
  }

  //helper function to ensure that all the GoogleAPI searches are done.
  var allFetchesFinished = function () {
    // console.log(matchedRestaurants);
    for (var i = 0; i < matchedRestaurants.length; i++) {
      if (!matchedRestaurants[i].googleFound) {
        return false;
      }
    }
    return true;
  };

  //This for loop goes through each of the restaurants and searches the Google API for each particular restaurant. 
  //This does a API call for EVERY restaurant in your array. Call is done async to save time. 
  for (var i = 0; i < matchedRestaurants.length; i++) {
    var restaurant = matchedRestaurants[i];
    var queryString = 
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
      'key=' + apiKeys.googleKeys().mapKey +
      '&location=' + restaurant.location.latitute + ',' + restaurant.location.longitude +
      '&name=' + restaurant.name +
      '&radius=100';
    // console.log(queryString);

    //Helper function to help me pass in data async
    (function googleRequest (queryString, rest) {
      request(queryString, function (error, response, body) {
        
        rest.googleFound = true;
        var restaurantData = JSON.parse(body).results[0];
        // console.log(JSON.parse(body));

        //If the Google API search doesn't yield "zero results"...
        if (JSON.parse(body).status !== 'ZERO_RESULTS') {
          
          //add a boolean if the restaurant is open now
          if (restaurantData.opening_hours) {
            restaurant.openNow = restaurantData.opening_hours.open_now;
          }

          //add the priceLevel as an integer, as number of $$$
          rest.priceLevel = restaurantData.price_level;

          //add the Google reviews rating
          rest.googleData = {
            rating: restaurantData.rating
          }
        }
        // console.log('checking!');

        //if all fetches finished, return the data
        if (allFetchesFinished()) {
          // console.log('allfetches')
          callback(matchedRestaurants);
        }
      })
    })(queryString, restaurant);
  }
}


//Because foursquare API does not give you a link to its own foursquare page (which is really dumb...
//this function automatically builds the URL)
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

//This is the Restaurant class. Each restaurant found in Yelp && Foursquare is added as a Restaurant
var Restaurant = function (name, address, url, lat, long, phoneNumber, imageUrl, yelpData, foursquareData, googleData) {
  this.name = name;
  this.address = address;
  this.url = url;
  this.location = {
    latitute: lat,
    longitude: long
  };
  this.yelpData = yelpData;
  this.yelpData.rating = this.yelpData.rating || 0;
  this.yelpData.reviewCount = this.yelpData.reviewCount || 0;

  //This is what the yelpData would look like:
  // {
  //   rating: 4,
  //   ratingUrl: 'https://www.yelp.com/image',
  //   url: 'https://www.yelp.com',
  //   reviewCount: 123
  // }

  this.foursquareData = foursquareData;
  this.foursquareData.rating = (this.foursquareData.rating / 2) || 0;
  this.foursquareData.reviewCount = this.foursquareData.reviewCount || 0;
  
  //This is what the foursquareData would look like:
  // {
  //   rating: 9.8,
  //   url: 'https://www.foursquare.com',
  //   reviewCount: 23
  // },

  this.googleData = googleData;

  //This is what the googleData would look like:
  // { rating: 4.2 }
  
  this.googleFound = false;

  this.totalReviews = this.yelpData.reviewCount + this.foursquareData.reviewCount;

  // this.compositeScore = (( this.yelpData.rating * 2 * this.yelpData.reviewCount +
  //                   this.foursquareData.rating * this.foursquareData.reviewCount ) / 
  //                   ( this.totalReviews )).toFixed(1);
  
  this.compositeScore = ((( this.yelpData.rating * this.yelpData.reviewCount) +
                    ((this.foursquareData.rating) * this.foursquareData.reviewCount )) / 
                    ( this.totalReviews )).toFixed(1);

  //This data is from Yelp
  this.phoneNumber = phoneNumber;
  this.imageUrl = imageUrl;

  //This data is from Google
  this.priceLevel = undefined;
  this.openNow = undefined;
}