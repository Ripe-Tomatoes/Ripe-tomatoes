angular.module('ripeT', ['ngMap'])

.config(function ($routeProvider, $httpProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'main.html',
      controller: 'MainController'
    })
    .when('/results', {
      templateUrl: 'searchResults.html',
      controller: 'MainController'
    })
    .when('/signin', {
      templateUrl: 'signin.html',
      controller: 'AuthController'
    })
    .when('/signup', {
      templateUrl: 'signup.html',
      controller: 'AuthController'
    })
    .when('/user/:name', {
      templateUrl: 'user.html',
      controller: 'MainController'
    })
    .otherwise({
      redirectTo: '/'
    });
})

.controller('MainController', function ($scope, $location, Search, State, Auth, User, $window, Reviews) {

  $scope.add = function (address, name) {
    var token = $window.localStorage.getItem('com.ripeT');
    User.addFavorite($scope.username, token, State.location, address, name);
    //console.log('add was run with', 'username:', $scope.username, 'stateloc', State.location,'add:', address, 'name:',name);
  };

  $scope.steal = function (location, address, name) {
    var token = $window.localStorage.getItem('com.ripeT');
    User.addFavorite($scope.username, token, location, address, name);
    //console.log('add was run with', 'username:', $scope.username, 'stateloc', State.location,'add:', address, 'name:',name);
  };

  $scope.makeFave = function (restaurant) {
    if (restaurant.isfave){
      restaurant.isfave= !restaurant.isfave;
    } else {
      restaurant.isfave= true;
    //console.log('makeFave was run')
    }
  }

  $scope.hideMe = function (restaurant) {
    restaurant.hide=true;
  };

  $scope.remove = function (address, name) {
    var token = $window.localStorage.getItem('com.ripeT');
    User.removeItem($scope.username, token, address, name).then(function() {
    });
  };

  $scope.retrieve = function () {
    var token   = $window.localStorage.getItem('com.ripeT'),
        results = [],
        loggedIn;
    //console.log($location);

    User.retrieveFavorites($location.$$path.slice(6), token).then(function (resp) {
      State.loggedIn = resp.data.loggedIn;
      $scope.loggedIn = State.loggedIn;
      resp.data.results.forEach(function (item) {
        Search.getResults(item[0], item[2]).then(function (resp) {
          if (resp.results) {
            resp.results.forEach(function (result) {
              if (item[1] === result.address[0]) {
                results.push(result);
              }
            })
          }
        });
      });
    });
    State.favorites = results;
    $scope.favorites = State.favorites;
  };

  $scope.checkIfHome = function () {
    console.log('checkifhome:', $scope.pagename === $scope.username);
    return $scope.pagename === $scope.username;
  };

  $scope.getUsername = function () {
    $scope.username = $location.$$path.slice(6);
  };

  $scope.checkUserPage = function () {
    if ($location.$$path.slice(0, 6) === '/user/') {
      $scope.pagename = $location.$$path.slice(6);
    }
  };

  $scope.isVisitor = function () {
    var hide =true;
    if ($scope.username && $scope.username !== $scope.pagename) {
    //console.log($scope.username !== $scope.pagename);
      hide = false;
    }
    return hide;
  };

  $scope.checkUser = function () {
    var token = $window.localStorage.getItem('com.ripeT');
    User.checkUser(token).then(function (resp) {
      if (resp.data.loggedIn) {
        $scope.loggedIn = State.loggedIn = true;
        $scope.username = State.username = resp.data.loggedIn;
      } else {
        State.loggedIn = false;
        State.username = '';
      }
    });
  };

  $scope.signout = function () {
    Auth.signout();
    State.loggedIn = false;
    State.username = '';
    State.favorites = [];
    $location.path('main');
  };

  $scope.username = State.username;

  $scope.calculateTomatoRating = function(num){
    return new Array(num);
  };

  $scope.getNumber = function(num, typeOfRating) {
    var ratingImages = {
      foursquare: {
        whole: 'foursquare_logo.png',
        half: 'foursquare_half.png',
        whole_gray: 'foursquare_grey.png'
      },
      ripe_tomatoes: {
        whole: 'tomato_map.png',
        half: 'tomato_half.png',
        whole_gray: 'tomato_grey.png'
      },
      google: {
        whole: 'google_full.png',
        half: 'google_half.png',
        whole_gray: 'google_grey.png'
      }
    };

    var arr = [];
    var fraction = num % 1;

    for(var i = 0; i < Math.floor(num); i++){
      arr.push( ratingImages[typeOfRating].whole );
    }

    if(fraction > .25 && fraction < .75){
      arr.push( ratingImages[typeOfRating].half );
    }
    else if (fraction >= .75){
      arr.push( ratingImages[typeOfRating].whole );
    }
    for(var i = arr.length; i < 5; i++){
      arr.push( ratingImages[typeOfRating].whole_gray );
    }

    return arr;
  };

  $scope.getReviews = function (data) {
    var results = [];
    data.forEach(function (item) {
      results.push([item.name, item.address[0]]);
    }); 
    return Reviews.get(results).then(function (resp) {
      return resp;
    });
  };

  $scope.addComment = function (comment, name, address) {
    Reviews.add(comment, State.username, name, address).then(function (resp) {
      $scope.getReviews($scope.results).then(function (res) {
          $scope.results.forEach(function (item, index) {
            item['reviews'] = res[index];
          });
        });
    });
  };

  $scope.loadResults = function () {
    console.log("loading results");
    State.location = $scope.location;
    Search.getResults($scope.location, $scope.name).then(function (resp) {
      if (resp['error']) {
        Search.results = $scope.results = [];
        console.log(resp['error']);
        $scope.error=resp['error'];
        $location.path('results');
      } else {
        Search.results = $scope.results = resp.results;

        $scope.error = '';

        $scope.getReviews(resp.results).then(function (res) {
          console.log(JSON.stringify(res));
          resp.results.forEach(function (item, index) {
            item['reviews'] = res[index];
          });
        });

        $location.path('results');
      }
    });
  };

  $scope.loggedIn = State.loggedIn;
  $scope.error = '';

  $scope.syncResults = function () {
    $scope.results = Search.results;
  };

  $scope.initializeMap = function (restaurants) {
    var map = new google.maps.Map(document.getElementById('map'), {
         center: {lat: 37.787767, lng: -122.400076},
         zoom: 1
    });
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    $scope.map = map;
    $scope.markers = [];
    var createMarker = function ( place, bounds ){
     var geometry = new google.maps.LatLng( place.location.latitute, place.location.longitude);
     bounds.extend(geometry);
     var marker = new google.maps.Marker({
       position: geometry,
       map: $scope.map,
       icon: 'tomato_map.png',
       title: place.name
     });
     google.maps.event.addListener(marker, 'click', function() {
       infowindow.setContent('<div>'+place.name+'</div><div>'+place.address+'</div><div>foursquare rating: '+place.foursquareData.rating+'</div><div>Yelp Rating: <img src='+place.yelpData.ratingUrl+'></img></div>');
       infowindow.open($scope.map, this);
     });
     $scope.markers.push(marker);
    };

    for (var i = 0; i < restaurants.length; i++){
     createMarker(restaurants[i], bounds);
    }
    $scope.map.setCenter(bounds.getCenter());
    $scope.map.fitBounds(bounds);
  };

})
.factory('Search', function ($http) {
  var getResults = function (loc, rest) {
    return $http({
      method: 'POST',
      url: '/search',
      data: {
        location: loc,
        restaurant: rest
      }
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  var results = {};

  return {
    getResults: getResults,
    results: results
  }
})
.controller('AuthController', function (Auth, $window, State, $scope, $location) {
  $scope.loggedIn = State.loggedIn;
  $scope.user = {};
  $scope.noteInit = function () {
    $scope.note = '';
  };
  $scope.signin = function () {
    // console.log(angular.element(document.querySelector('.modal-backdrop')));
    angular.element(document.querySelector('.modal-backdrop')).remove();
    Auth.signin($scope.user)
      .then(function (token) {
            console.log("logging in", $scope.user);

        if (token !== 'null') {
          State.username = $scope.user.username;
          $window.localStorage.setItem('com.ripeT', token);
          $location.path('/user/'+State.username);
          State.loggedIn = true;
        } else {
          $scope.note = 'incorrect username or password';
        }

        document.getElementByClassName("modal").remove();
      });
  };
  $scope.signup = function () {
    angular.element(document.querySelector('.modal-backdrop')).remove();

    Auth.signup($scope.user)
      .then(function (token) {
        if (token !== 'null') {
          State.username = $scope.user.username;
          $window.localStorage.setItem('com.ripeT', token);
          $location.path('/user/'+State.username);
          State.loggedIn = true;
        } else {
          $scope.note = 'username already taken';
        }
      });
  };
})

.factory('Auth', function ($http, $window, $location) {

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/signup',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var signin = function (user) {
    return $http({
      method: 'POST',
      url: '/signin',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var signout = function () {
    $window.localStorage.removeItem('com.ripeT');
  };

  var isAuth = function () {
    return !!$window.localStorage.getItem('com.ripeT');
  };

  return {
    signup: signup,
    signin: signin,
    isAuth: isAuth,
    signout: signout
  };
})

.factory('State', function () {
  return {
    username: '',
    loggedIn: false,
    location: '',
    favorites: []
  };
})

.factory('User', function ($http) {
  var addFavorite = function (username, token, location, address, name) {
    console.log('favoritePost', username)
    return $http({
      method: 'POST',
      url: '/user/' + username,
      data: {
        op: 'add',
        token: token,
        location: location,
        address: address,
        name: name
      }
    })
    // .then(function (resp) {
    //   return resp.data.outcome;
    // });
  };

  var retrieveFavorites = function (username, token) {
    return $http({
      method: 'POST',
      url: '/user/' + username,
      data: {
        op: 'retrieve',
        token: token
      }
    });
  };

  var removeItem = function (username, token, address, name) {
    return $http({
      method: 'POST',
      url: '/user/' + username,
      data: {
        op: 'remove',
        token: token,
        address: address,
        name: name
      }
    })
  };

  var checkUser = function (token) {
    return $http({
      method: 'POST',
      url: '/check',
      data: {
        token: token
      }
    })
  }

  return {
    addFavorite: addFavorite,
    retrieveFavorites: retrieveFavorites,
    removeItem: removeItem,
    checkUser: checkUser
  };
})

.factory('Reviews', function ($http) {
  var get = function (restaurants) {
    return $http({
      method: 'POST',
      url: '/reviews',
      data: {
        restaurants: restaurants
      }
    }).then(function (resp) {
      return resp.data.results;
    });
  };

  var add = function (comment, user, name, address) {
    return $http({
      method: 'POST',
      url: '/review',
      data: {
        comment: comment,
        user: user,
        name: name,
        address
      }
    }).then(function (resp) {
      return resp.data;
    });
  };

  return {
    add: add,
    get: get
  }
})

















//name, address, ratings, GEO,

