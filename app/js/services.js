(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

     .factory('messageList', ['fbutil', '$firebaseArray', function(fbutil, $firebaseArray) {
       return $firebaseArray(fbutil.ref('messages').limitToLast(10));
     }]);

})();

