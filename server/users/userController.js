var User  = require('./userModel.js'),
    Q     = require('q'),
    jwt   = require('jwt-simple');

//This is all of the functions regarding user functionality
module.exports = {
  //handles user signIn. If user does not exist, sends an error that user does not 
  //exist in database. If user exists && pw matches, creates a jwtencoded token
  signin: function (req, res, next) {
    var username = req.body.username,
        password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function (user) {
        if (!user) {
          res.json({token: 'null'});
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token});
              } else {
                res.json({token: 'null'});
                return next();
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  //Registers a new user. If user exists, sends an null token. otherwise
  //creates the user in the database
  signup: function (req, res, next) {
    var username  = req.body.username,
        password  = req.body.password,
        create,
        newUser;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function(user) {
        //if user already exists, do not issue token
        if (user) {
          res.json({token: 'null'});
          next();

        //else create the new user
        } else {
          create = Q.nbind(User.create, User);
          newUser = {
            username: username,
            password: password,
            favorites: []
          };
          return create(newUser);
        }
      })
      //...and then create a new token for the user
      .then(function (user) {
        if (user) {
          var token = jwt.encode(user, 'secret');
          res.json({ token: token });
        }
      })
      //if error, log error
      .fail(function (error) {
        console.log(error);
        next(error);
      });
  },

  //adds a restaurant to a user's favorite array, if and only if the 
  //username is matched in the database
  addFavorite: function (req, res) {
    var username  = req.params.name,
        location  = req.body.location,
        token     = req.body.token,
        address   = req.body.address,
        name      = req.body.name;
    
    var user = jwt.decode(token, 'secret');
    var pack = [location, address, name];

    if (user.username === username) {
      var update = Q.nbind(User.update, User);
      update(
        { username: username },
        { $addToSet: { favorites: pack } }
      );
    }
  },

  //retrieves all of the favorites of a user. First checks to see if 
  //the user is logged in, and then sends back the favorites array
  retrieveFavorites: function (req, res) {
    var username  = req.params.name,
        token     = req.body.token,
        loggedIn = false;

    var user = token ? jwt.decode(token, 'secret').username : 'null';

    if (user === username) {
      loggedIn = true;
    }

    var findOne = Q.nbind(User.findOne, User);
    findOne({ username: username })
      .then(function(user) {
        console.log(user);
        res.json({
          results: user.favorites,
          loggedIn: loggedIn
        });
      });
  },

  //Removes a favorite from a user's favorite array. Pulls it from the 
  //database.
  removeFromFavorites: function (req, res) {
    var username  = req.params.name,
        token     = req.body.token,
        address   = req.body.address,
        name      = req.body.name,
        newFavorites = [];

    var user = token ? jwt.decode(token, 'secret').username : 'null';

    if (user === username) {
      
      var update = Q.nbind(User.update, User);
      update(
        { username: username },
        { $pull: { favorites: { $in: [ address ] } } }
      )
      .then(function() {
        res.end();
      });
    }
  },

  //Helper function to check if a user is logged in and if the token 
  //has expired
  checkUser: function (req, res) {
    var token = req.body.token;

    var user = token ? jwt.decode(token, 'secret').username : 'null';

    var findOne = Q.nbind(User.findOne, User);
    findOne({ username: user })
      .then(function(user) {
        if (!user) {
          res.json({
            loggedIn: false
          });
        } else {
          res.json({
            loggedIn: user.username
          });
        }
      });
  }
}

