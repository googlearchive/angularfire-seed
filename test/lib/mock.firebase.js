
angular.module('mock.firebase', [])
  .run(function($window) {
    $window.Firebase = $window.MockFirebase;
  })
  .factory('Firebase', function($window) {
    return $window.MockFirebase;
  });