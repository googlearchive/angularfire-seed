'use strict';

/* Filters */

angular.module('myApp')
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  });