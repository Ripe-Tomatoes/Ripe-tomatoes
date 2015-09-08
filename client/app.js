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
    .otherwise({
      redirectTo: '/'
    });
})

.controller('MainController', function ($scope, $location, Factory) {
  $scope.calculateTomatoRating = function(num){
    return new Array(num);
  };

  $scope.getNumber = function(num, typeOfRating) {
    var ratingImages = {
      foursquare: {
        whole: 'foursquare_logo.png',
        half: 'tomato_map.png',
        whole_gray: 'foursquare-blue.ico'
      },
      ripe_tomatoes: {
        whole: 'tomato_map.png',
        half: 'foursquare_logo.png',
        whole_gray: 'foursquare-blue.ico'
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
    Factory.getResults($scope.location, $scope.name).then(function (resp) {
      if (resp['error']) {
        Factory.results = $scope.results = resp;
        $location.path('results');
      } else {
        Factory.results = $scope.results = resp.results;
        $location.path('results');
      }
    });
  };

  $scope.error = '';

  $scope.syncResults = function () {
    $scope.results = Factory.results;
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
.factory('Factory', function ($http) {

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


//name, address, ratings, GEO,

