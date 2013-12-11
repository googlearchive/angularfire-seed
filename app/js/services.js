(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      // a simple utility to create references to Firebase paths
      .factory('firebaseRef', ['Firebase', 'FBURL', function(Firebase, FBURL) {
         /**
          * @function
          * @name firebaseRef
          * @param {String|Array...} path
          * @return a Firebase instance
          */
         return function(path) {
            return new Firebase(pathRef([FBURL].concat(Array.prototype.slice.call(arguments))));
         }
      }])

      // a simple utility to create $firebase objects from angularFire
      .service('syncData', ['$firebase', 'firebaseRef', function($firebase, firebaseRef) {
         /**
          * @function
          * @name syncData
          * @param {String|Array...} path
          * @param {int} [limit]
          * @return a Firebase instance
          */
         return function(path, limit) {
            var ref = firebaseRef(path);
            limit && (ref = ref.limit(limit));
            return $firebase(ref);
         }
      }])

      .factory('loginService', ['$rootScope', '$firebaseAuth', 'firebaseRef', 'profileCreator', '$timeout',
         function($rootScope, $firebaseAuth, firebaseRef, profileCreator, $timeout) {
            var auth = null;
            return {
               init: function(path) {
                  return auth = $firebaseAuth(firebaseRef(), {path: path});
               },

               /**
                * @param {string} email
                * @param {string} pass
                * @param {Function} [callback]
                * @returns {*}
                */
               login: function(email, pass, callback) {
                  assertAuth();

                  if( callback ) {
                     var subs = [];
                     var fn = function(err, user) {
                        angular.forEach(subs, function(s) {s();});
                        //$timeout(function() {
                        callback(err, user);
                         //});
                     };
                     subs.push($rootScope.$on('$firebaseAuth:login', function(evt, user) {
                        fn(null, user);
                     }));
                     subs.push($rootScope.$on('$firebaseAuth:logout', function(evt) {
                        fn();
                     }));
                     subs.push($rootScope.$on('$firebaseAuth:error', function(evt, err) {
                        console.error('login failed', err);
                        fn(err);
                     }));
                  }

                  auth.$login('password', {
                     email: email,
                     password: pass,
                     rememberMe: true
                  });

//                  .then(function(user) {
//                     callback && callback(null, user);
//                  }, callback);
               },

               logout: function() {
                  assertAuth();
                  auth.$logout();
               },

               changePassword: function(opts) {
                  assertAuth();
                  if( !opts.oldpass || !opts.newpass ) {
                     opts.callback('Please enter a password');
                  }
                  else if( opts.newpass !== opts.confirm ) {
                     opts.callback('Passwords do not match');
                  }
                  else {
                     //todo-hack
                     var ref = firebaseRef();
                     var authHack = new FirebaseSimpleLogin(ref, function() {});
                     authHack.changePassword(opts.email, opts.oldpass, opts.newpass, function(err) {
                        $timeout(function() {
                           opts.callback(errMsg(err));
                        });
                     })
                  }
               },

               createAccount: function(email, pass, callback) {
                  assertAuth();
                  auth.$createUser(email, pass, function(err, user) {
                     if( callback ) {
                        $timeout(function() {
                           callback(err, user);
                        });
                     }
                  });
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

   function errMsg(err) {
      return err? '['+err.code+'] ' + err.toString() : null;
   }

   function pathRef(args) {
      for(var i=0; i < args.length; i++) {
         if( typeof(args[i]) === 'object' ) {
            args[i] = pathRef(args[i]);
         }
      }
      return args.join('/');
   }
})();

