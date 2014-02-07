
angular.module('myApp.service.login', ['firebase', 'myApp.service.firebase'])

   .factory('loginService', ['$rootScope', '$firebaseSimpleLogin', 'firebaseRef', 'profileCreator', '$timeout', '$q',
      function($rootScope, $firebaseSimpleLogin, firebaseRef, profileCreator, $timeout, $q) {
         var auth = null;
         return {
            init: function() {
               return auth = $firebaseSimpleLogin(firebaseRef());
            },

            /**
             * @param {string} email
             * @param {string} pass
             * @param {Function} [callback]
             * @returns {*}
             */
            login: function(email, pass, callback) {
               assertAuth();
               auth.$login('password', {
                  email: email,
                  password: pass,
                  rememberMe: true
               }).then(function(user) {
                     if( callback ) {
                        //todo-bug https://github.com/firebase/angularFire/issues/199
                        $timeout(function() {
                           callback(null, user);
                        });
                     }
                  }, callback);
            },

            logout: function() {
               assertAuth();
               auth.$logout();
            },

            changePassword: function(opts) {
               assertAuth();
               var cb = opts.callback || function() {};
               if( !opts.oldpass || !opts.newpass ) {
                  $timeout(function(){ cb('Please enter a password'); });
               }
               else if( opts.newpass !== opts.confirm ) {
                  $timeout(function() { cb('Passwords do not match'); });
               }
               else {
                  auth.$changePassword(opts.email, opts.oldpass, opts.newpass).then(function() { cb && cb(null) }, cb);
               }
            },

            createAccount: function(email, pass, callback) {
               assertAuth();
               auth.$createUser(email, pass).then(function(user) { callback && callback(null, user) }, callback);
            },

            changeEmail: function(opts) {
               assertAuth();
               var cb = opts.callback || function() {};
               var self = this;
               var oldUid = auth.user.uid;
               var oldEmail = auth.user.email;
               var oldProfile;
               var refProfile = new Firebase(opts.userRef).child(oldUid);

               // promise functions
               var authenticate = function() {
                  var d = $q.defer();
                  self.login(oldEmail, opts.pass, function(err, user) {
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
                  self.createAccount(opts.newEmail, opts.pass, function(err, user) {
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
                  var refNewProfile = new Firebase(opts.userRef).child(auth.user.uid);
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
            },

            createProfile: profileCreator
         };

         function assertAuth() {
            if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
         }
      }])

   .factory('profileCreator', ['firebaseRef', '$timeout', function(firebaseRef, $timeout) {
      return function(id, email, callback) {
         firebaseRef('users/'+id).set({email: email, name: firstPartOfEmail(email)}, function(err) {
            //err && console.error(err);
            if( callback ) {
               $timeout(function() {
                  callback(err);
               })
            }
         });

         function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@'))||'');
         }

         function ucfirst (str) {
            // credits: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
         }
      }
   }]);
