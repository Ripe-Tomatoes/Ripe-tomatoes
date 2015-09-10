var User  = require('./userModel.js'),
    Q     = require('q'),
    jwt   = require('jwt-simple');

module.exports = {
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

  signup: function (req, res, next) {
    var username  = req.body.username,
        password  = req.body.password,
        create,
        newUser;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function(user) {
        if (user) {
          res.json({token: 'null'});
          next();
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
      .then(function (user) {
        if (user) {
          var token = jwt.encode(user, 'secret');
          res.json({ token: token });
        }
      })
      .fail(function (error) {
        console.log(error);
        next(error);
      });
  },

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

  retrieveFavorites: function (req, res) {
    var username  = req.params.name,
        token     = req.body.token,
        loggedIn = false;

    var user = token ? jwt.decode(token, 'secret').username : 'null';

    if (user === username) {
      loggedIn = true;
    }

    var findOne = Q.nbind(User.findOne, User);
    findOne({username: username})
      .then(function(user) {
        res.json({
          results: user.favorites,
          loggedIn: loggedIn
        });
      });
  }
}

