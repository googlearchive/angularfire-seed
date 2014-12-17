angular.module('mock.fbutil', ['firebase.utils'])
  .config(function($provide) {
    $provide.decorator('fbutil', function($delegate) {
      // always use the same reference so we can reference
      // it in the test units
      $delegate.$$ref = new MockFirebase();
      $delegate.ref = function() {
        return $delegate.$$ref;
      };
      return $delegate;
    });
  });
