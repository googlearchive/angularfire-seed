(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      .factory('loginService', ['angularFireAuth', 'profileCreator', '$location', '$timeout',
         function(angularFireAuth, profileCreator, $location, $timeout) {
            return {
               /**
                * @param {string} email
                * @param {string} pass
                * @param {string} [redirect]
                * @param {Function} [callback]
                * @returns {*}
                */
               login: function(email, pass, redirect, callback) {
                  var p = angularFireAuth.login('password', {
                     email: email,
                     password: pass,
                     rememberMe: true
                  });

                  p.then(function(user) {
                     if( redirect ) {
                        $location.path(redirect);
                     }
                     callback && callback(null, user);
                  }, callback);

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
                     angularFireAuth._authClient.changePassword(opts.email, opts.oldpass, opts.newpass, function(err) {
                        $timeout(opts.callback.bind(null, errMsg(err)));
                     })
                  }
               },

               createAccount: function(email, pass, callback) {
                  angularFireAuth._authClient.createUser(email, pass, function(err, user) {
                     callback && $timeout(callback.bind(null, err, user))
                  });
               },

               createProfile: profileCreator
            }
         }])

      .factory('profileCreator', ['Firebase', 'FBURL', '$timeout', function(Firebase, FBURL, $timeout) {
         return function(id, email, callback) {
            setTimeout(function() {
               console.log('profileCreator', id, email, {email: email, name: firstPartOfEmail(email)}); //debug
               new Firebase(FBURL).child('users/'+id).set({email: email, name: firstPartOfEmail(email)}, function(err) {
                  //err && console.error(err);
                  callback && $timeout(callback.bind(null, err));
               });

            }, 100);

            function firstPartOfEmail(email) {
               return ucfirst(email.substr(0, email.indexOf('@'))||'');
            }

            function ucfirst (str) {
               // http://kevin.vanzonneveld.net
               // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
               // +   bugfixed by: Onno Marsman
               // +   improved by: Brett Zamir (http://brett-zamir.me)
               // *     example 1: ucfirst('kevin van zonneveld');
               // *     returns 1: 'Kevin van zonneveld'
               str += '';
               var f = str.charAt(0).toUpperCase();
               return f + str.substr(1);
            }
         }
      }]);

   function errMsg(err) {
      return err? '['+err.code+'] ' + err.toString() : null;
   }
})();

