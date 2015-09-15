//File for API keys
//gitignore


module.exports.yelpKeys = function() {
  return {
    consumer_key: "YELP_KEY", 
    consumer_secret: "YELP_SECRET",
    token: "YELP_TOKEN",
    token_secret: "YELP_TOKEN_SECRET"
  };
};


module.exports.foursquareKeys = function() {
  return {
    client_ID: '4SQKEY',
    client_secret: '4SQSECRET'
  };
};

module.exports.googleKeys = function () {
  return {
    mapKey: 'mapKey',
    searchKey: 'searchKey'
  }
}