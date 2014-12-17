

angular.module('mock.firebaseAuth', ['firebase'])
  .config(function($provide) {
    $provide.decorator('$firebaseAuth', function($delegate) {
      var _auth = $delegate;
      function mockAuth(ref) {
        // use a single auth instance and store it for reference from test units
        if( !mockAuth.$$last ) {
          mockAuth.$$last = _auth(ref);
          mockAuth.$$last.$$ref = ref;
        }
        return mockAuth.$$last;
      }
      return mockAuth;
    });
  });