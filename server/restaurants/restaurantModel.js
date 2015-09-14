var mongoose  = require('mongoose'),
    bcrypt    = require('bcrypt-nodejs'),
    Q         = require('q'),
    SALT_WORK_FACTOR = 10;

var RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  salt: String,
  reviews: {
    type: Array
  }
});

// RestaurantSchema.methods.;asjkfa;'sdf' = function (candidatePassword) {

// };

module.exports = mongoose.model('restaurants', RestaurantSchema);