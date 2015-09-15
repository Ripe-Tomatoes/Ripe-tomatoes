var Restaurant  = require('./restaurantModel.js'),
    Q     = require('q'),
    jwt   = require('jwt-simple');

//Ignore the other "restaurantContoller.js" file--it's a typo
//This file handles all of the restaurant review (Ripe Tomato reviews, not any from 
//any external APIs) and uses an MVC model
module.exports = {
  
  //Finds a particular restaurant and sends all of the reviews found for that
  //specific restaurant and sends it back to the client in the form of an object
  retrieveReviews: function (req, res) {
    var response = [], length = req.body.restaurants.length, count = 0;
    var findOne = Q.nbind(Restaurant.findOne, Restaurant);
    var create = Q.nbind(Restaurant.create, Restaurant);

      var name, address,
            newRestaurant;
      var runThrough = function () {
        name = req.body.restaurants[count][0];
        address = req.body.restaurants[count][1];
        findOne({ name: name, address: address })
          .then(function (restaurant) {
            //if restaurant doesn't exist in database, create new one and push
            //empty array as response to client (aka 'no reviews currently')
            if (!restaurant) {
              newRestaurant = {
                name: name,
                address: address,
                reviews: []
              };
              response.push([]);
              console.log('pushin');
              create(newRestaurant);
            } else {
             response.push(restaurant.reviews);
            }
            count++;
            if (count < length) {
              runThrough();
            } else {
              res.json({ results: response });
            }
          });
      };
      runThrough();
  },
  
  //Adds review to a particular restaurant and adds it to the database
  addReview: function (req, res) {
    var username  = req.body.user,
        comment   = req.body.comment,
        restaurant = req.body.name,
        address   = req.body.address[0];

    var pack = [comment, username];
    console.log(username, comment, restaurant, address[0])
    var update = Q.nbind(Restaurant.update, Restaurant);

    update(
      { name: restaurant, address: address },
      { $addToSet: { reviews: pack } }
    ).then(function() {
      res.end('fini');
    });
  }
}

