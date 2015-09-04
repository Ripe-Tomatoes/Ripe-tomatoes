angular.module('ripeT', [])

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

.controller('MainController', function ($scope, Factory) {

  $scope.loadResults = function () {
    console.log("loading results");
    Factory.results = Factory.getResults($scope.location, $scope.name);
    window.location.assign('http://localhost:3000/#/results');
  }

  $scope.renderResults = function () {

  }
})
.factory('Factory', function ($http) {

  var getResults = function (loc, rest) {
    console.log("getting results");
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

