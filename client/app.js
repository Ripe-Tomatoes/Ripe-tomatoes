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
    // .when('/user', {
    //   templateUrl: 'home.html',
    //   controller: 'MainController'
    // })
    .otherwise({
      redirectTo: '/'
    });

    // $httpProvider.interceptors.push('AttachTokens');
})

.factory('AttachTokens', function ($window) {
  var attach = function (object) {
    var jwt = $window.localStorage.getItem('com.ripeT');
    if (jwt) {
      object.headers['x-access-token'] = jwt;
    }
    object.headers['Allow-Control-Allow-Origin'] = '*';
    return object;
  };
  return attach;
})

.controller('MainController', function ($scope, $location, Search, State, Auth) {

  $scope.add = function () {

  };

  $scope.signout = function () {
    Auth.signout();
    State.loggedIn = false;
    State.username = '';
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
    for(var i = arr.length; i < 10; i++){
      arr.push( ratingImages[typeOfRating].whole_gray );
    }

    return arr;
  };

  $scope.loadResults = function () {
    console.log("loading results");
    Search.getResults($scope.location, $scope.name).then(function (resp) {
      if (resp['error']) {
        Search.results = $scope.results = resp;
        $location.path('results');
      } else {
        Search.results = $scope.results = resp.results;
        $location.path('results');
      }
    });
  };

  $scope.loggedIn = State.loggedIn;
  $scope.error = '';

  $scope.syncResults = function () {
    $scope.results = Search.results;
  };

  $scope.initializeMap = function () {
    var map = new google.maps.Map(document.getElementById('map'), {
         center: {lat: 37.787767, lng: -122.400076},
         zoom: 1
    });
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    $scope.map = map;
    $scope.markers = [];
    var createMarker = function ( place, bounds ){
     console.log(place)
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

    for (var i = 0; i < $scope.results.length; i++){
     createMarker($scope.results[i], bounds);
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
    Auth.signin($scope.user)
      .then(function (token) {
        if (token !== 'null') {
          State.username = $scope.user.username;
          $window.localStorage.setItem('com.ripeT', token);
          $location.path('/results');
          State.loggedIn = true;
        } else {
          $scope.note = 'incorrect username or password';
        }
      });
  };
  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (token) {
        if (token !== 'null') {
          State.username = $scope.user.username;
          $window.localStorage.setItem('com.ripeT', token);
          $location.path('/results');
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
  return {loggedIn: false};
});

//name, address, ratings, GEO,

