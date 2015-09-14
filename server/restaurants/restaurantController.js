var Restaurant  = require('./restaurantModel.js'),
    Q     = require('q'),
    jwt   = require('jwt-simple');

module.exports = {
  retrieveReviews: function (req, res) {
    var response = [], length = req.body.restaurants.length, count = 0;
    var findOne = Q.nbind(Restaurant.findOne, Restaurant);
    var create = Q.nbind(Restaurant.create, Restaurant);

      var name, address,
            newRestaurant;
      var runThrough = function () {
        name = req.body.restaurants[count][0],
        address = req.body.restaurants[count][1],
        findOne({ name: name, address: address })
          .then(function (restaurant) {
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

