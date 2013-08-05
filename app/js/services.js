(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      .factory('loginService', ['angularFireAuth', '$location', '$timeout', '$rootScope', function(angularFireAuth, $location, $timeout, $rootScope) {
         return {
            /**
             * @param {string} email
             * @param {string} pass
             * @param {string} [redirect]
             * @returns {*}
             */
            login: function(email, pass, redirect, errorCallback) {
               var p = angularFireAuth.login('password', {
                  email: email,
                  password: pass,
                  rememberMe: true
               });

               p.then(function() {
                  console.log('then invoked'); //debug
                  if( redirect ) {
                     console.log('login redirect', redirect); //debug
                     $location.path(redirect);
                  }
               }, function(err) {
                  if( errorCallback ) {
                     errorCallback(errMsg(err));
                  }
               });

               return p;
            },

            /**
             * @param {string} [redirectPath]
             */
            logout: function(redirectPath) {
               angularFireAuth.logout();
               if( redirectPath ) {
                  $location.path(redirectPath);
               }
            },

            changePassword: function(opts) {
               if( !opts.oldpass || !opts.newpass ) {
                  $timeout(callback.bind(null, 'Please enter a password'));
               }
               else if( opts.newpass !== opts.confirm ) {
                  $timeout(opts.callback.bind(null, 'Passwords do not match'));
               }
               else {
                  console.log('changing pass'); //debug
                  angularFireAuth._authClient.changePassword(opts.email, opts.oldpass, opts.newpass, function(err) {
                     $timeout(opts.callback.bind(null, errMsg(err)));
                  })
               }
            },

            /**
             * @param {string} path
             */
            redirectOnLogin: function(path, cancelOnPathChange) {
               var subs = [];
               function disposeAll() {
                  console.log('disposing all'); //debug
                  angular.forEach(subs, function(s) { s(); });
                  subs = null;
               }
               subs.push($rootScope.$on('angularFireAuth:login', function() {
                  console.log('login detected', path); //debug
                  $timeout(function() {
                     $location.replace();
                     $location.path(path);
                     disposeAll();
                  })
               }));
               if( cancelOnPathChange ) {
                  subs.push($rootScope.$on('$routeChangeSuccess', disposeAll));
               }
               return disposeAll;
            }
         }
      }]);

   function errMsg(err) {
      return err? '['+err.code+'] ' + err.toString() : null;
   }
})();

