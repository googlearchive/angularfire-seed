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
            }
         }
      }]);

   function errMsg(err) {
      return err? '['+err.code+'] ' + err.toString() : null;
   }
})();

