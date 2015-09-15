//API search functions

var apiKeys = require('../../apiKeys.js');
var request = require("request");
var yelp = require("yelp").createClient(apiKeys.yelpKeys());

module.exports.yelpSearch = function (searchTerm, callback){
  var results = yelp.search(searchTerm, function(err, data){
    if(err){
      callback({error: 'no geography that matches user inquiry found',
                error_code: 50});
    }else{
      callback(data);
    }
  });
};

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
    if (parsedBody.meta.code === 400) {
      if (parsedBody.meta.errorType === 'failed_geocode') {
        console.log('no geography that matches user inquiry found');
        callback({error: 'no geography that matches user inquiry found',
                  error_code: 50})
      }
    } else if (parsedBody.meta.code === 500) {
      console.log('foursquare server error');
    } else {
      bodyDir = parsedBody.response.groups[0]
      callback(bodyDir);
    }


  })
}

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
        // console.log(parsedBody.results);
      })
    }
   
  })

  // var queryString = '';
  // request(queryString, function (error, response, body) {
  //   if (error) {
  //     throw error;
  //   }
  //   var parsedBody = JSON.parse(body);
  //   console.log(parsedBody);
  //   //insert forloop for each restaurant int he response.
  //   //do second API query to get result details
  // })
}

module.exports.matchRestaurants = function (yelpArray, foursquareArray, callback) {
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

  var allFetchesFinished = function () {
    // console.log(matchedRestaurants);
    for (var i = 0; i < matchedRestaurants.length; i++) {
      if (!matchedRestaurants[i].googleFound) {
        console.log('found false for ', matchedRestaurants[i].name);
        return false;
      }
    }
    return true;
  };


  for (var i = 0; i < matchedRestaurants.length; i++) {
    var restaurant = matchedRestaurants[i];
    var queryString = 
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
      'key=' + apiKeys.googleKeys().mapKey +
      '&location=' + restaurant.location.latitute + ',' + restaurant.location.longitude +
      '&name=' + restaurant.name +
      '&radius=100';
    // console.log(queryString);

    function googleRequest (queryString, rest) {
      request(queryString, function (error, response, body) {
        
        rest.googleFound = true;
        var restaurantData = JSON.parse(body).results[0];
        // console.log(JSON.parse(body));
        if (JSON.parse(body).status !== 'ZERO_RESULTS') {
          if (restaurantData.opening_hours) {
            restaurant.openNow = restaurantData.opening_hours.open_now;
          }
          rest.priceLevel = restaurantData.price_level;
          rest.googleData = {
            rating: restaurantData.rating
          }
        }
        // console.log('checking!');
        if (allFetchesFinished()) {
          // console.log('allfetches')
          callback(matchedRestaurants);
        }
      })
    }

    googleRequest(queryString, restaurant);
    

  }


  // var counter = 0;
  // for (var restaurant = 0; restaurant < matchedRestaurants.length; restaurant++) {
  //   for (var restaurantG = 0; restaurantG < googleArray.length; restaurantG++) {
  //     if (matchedRestaurants[restaurant].name === removeCommonWords(googleArray[restaurantG].name) 
  //       // && matchedRestaurants[restaurant].address === extractAddressNumber(googleArray[restaurantG].vicinity)
  //       ) {
  //       console.log('match found!');
  //       counter++;
  //       matchedRestaurants[restaurant].googleData = {rating: googleArray[restaurantG].rating};

  //     }
  //   }
  // }
  // console.log(counter, ' matches found');
  // return matchedRestaurants;
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
  // {
  //   rating: 4,
  //   ratingUrl: 'https://www.yelp.com/image',
  //   url: 'https://www.yelp.com',
  //   reviewCount: 123
  // }

  this.foursquareData = foursquareData;
  this.foursquareData.rating = (this.foursquareData.rating / 2) || 0;
  this.foursquareData.reviewCount = this.foursquareData.reviewCount || 0;
  // {
  //   rating: 9.8,
  //   url: 'https://www.foursquare.com',
  //   reviewCount: 23
  // },

  this.googleData = googleData;
  // { rating: 4.2 }
  
  this.googleFound = false;

  this.totalReviews = this.yelpData.reviewCount + this.foursquareData.reviewCount;

  // this.compositeScore = (( this.yelpData.rating * 2 * this.yelpData.reviewCount +
  //                   this.foursquareData.rating * this.foursquareData.reviewCount ) / 
  //                   ( this.totalReviews )).toFixed(1);
  
  this.compositeScore = ((( this.yelpData.rating * this.yelpData.reviewCount) +
                    ((this.foursquareData.rating) * this.foursquareData.reviewCount )) / 
                    ( this.totalReviews )).toFixed(1);

  this.phoneNumber = phoneNumber;
  this.imageUrl = imageUrl;
  this.priceLevel = undefined;
  this.openNow = undefined;
}