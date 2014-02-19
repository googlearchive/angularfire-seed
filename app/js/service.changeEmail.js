angular.module('myApp.service.changeEmail', ['myApp.service.login', 'myApp.service.firebase'])
   .factory('changeEmailService', ['$rootScope', 'firebaseRef', '$timeout', '$q', 'loginService',
      function($rootScope, firebaseRef, $timeout, $q, loginService) {
         var auth = $rootScope.auth;
         return function(opts) {
            var cb = opts.callback || function() {};
            var oldUid = auth.user.uid;
            var oldEmail = auth.user.email;
            var oldProfile;
            var refProfile = firebaseRef('users', oldUid);

            // promise functions
            var authenticate = function() {
               var d = $q.defer();
               loginService.login(oldEmail, opts.pass, function(err, user) {
                  if (err) {
                     d.reject(err);
                  } else {
                     d.resolve();
                  }
               });
               return d.promise;
            };

            var loadOldProfile = function() {
               var d = $q.defer();
               refProfile.once('value',
                  function(snap){
                     oldProfile = snap.val();
                     // update user profile to have new email
                     oldProfile.email = opts.newEmail;
                     d.resolve();
                  },
                  function(err){
                     d.reject(err);
                  });
               return d.promise;
            };

            var createNewAccount = function() {
               var d = $q.defer();
               loginService.createAccount(opts.newEmail, opts.pass, function(err, user) {
                  if (err) {
                     d.reject(err);
                  } else {
                     d.resolve();
                  }
               });
               return d.promise;
            };

            var copyProfile = function() {
               var d = $q.defer();
               var refNewProfile = firebaseRef('users', auth.user.uid);
               refNewProfile.set(oldProfile, function(err) {
                  if (err) {
                     d.reject(err);
                  } else {
                     d.resolve();
                  }
               });
               return d.promise;
            };

            var removeOldProfile = function() {
               var d = $q.defer();
               refProfile.remove(function(err) {
                  if (err) {
                     d.reject(err);
                  } else {
                     d.resolve();
                  }
               });
               return d.promise;
            };

            var removeOldLogin = function() {
               var d = $q.defer();
               auth.$removeUser(oldEmail, opts.pass).then(function() {
                  d.resolve();
               }, function(err) {
                  d.reject(err);
               });
               return d.promise;
            };

            var errorFn = function(err) {
               $timeout(function() { cb(err); });
            };
            // execute activities in order; first we authenticate the user
            authenticate()
               // then we fetch old account details
               .then( loadOldProfile )
               // then we create a new account
               .then( createNewAccount )
               // then we copy old account info
               .then( copyProfile )
               // and once they safely exist, then we can delete the old ones
               .then( removeOldProfile )
               .then( removeOldLogin )
               // success
               .then( function() { cb && cb(null) }, cb )
               .catch( errorFn );
      };
   }]);