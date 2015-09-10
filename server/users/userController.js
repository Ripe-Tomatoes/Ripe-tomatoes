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
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token});
              } else {
                return next(new Error('No user'));
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
    console.log(req.body);
    findUser({username: username})
      .then(function(user) {
        if (user) {
          console.log('. . . user exists . . .');
          next(new Error('User already exist!'));
        } else {
          console.log('...trying to create');
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
        console.log('at token stage');
        var token = jwt.encode(user, 'secret');
        res.json({token: token});
      })
      .fail(function (error) {
        console.log(error);
        next(error);
      });
  }
}