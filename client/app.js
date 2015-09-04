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
    Factory.getResults($scope.location, $scope.name).then(function (resp) {
      console.log(resp);
      $scope.results = resp;
      window.location.assign('http://localhost:3000/#/results');
    });
  };

  // $scope.renderResults = function () {
  //   $scope.results = Factory.results;
  // };

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

