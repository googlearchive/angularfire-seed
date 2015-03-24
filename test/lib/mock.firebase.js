
//todo-mock
MockFirebase.prototype.orderByKey = function() { return this; };
MockFirebase.prototype.orderByPriority = function() { return this; };
MockFirebase.prototype.orderByValue = function() { return this; };
MockFirebase.prototype.orderByChild = function() { return this; };
MockFirebase.prototype.limitToLast = function() { return this; };
MockFirebase.prototype.limitToFirst = function() { return this; };
MockFirebase.prototype.startAt = function() { return this; };
MockFirebase.prototype.endAt = function() { return this; };

angular.module('mock.firebase', [])
  .run(function($window) {
    $window.Firebase = $window.MockFirebase;
  })
  .factory('Firebase', function($window) {
    return $window.MockFirebase;
  });