/**
 * This module monitors angularFire's authentication and performs actions based on authentication state.
 *
 * See usage examples here: https://gist.github.com/katowulf/7328023
 */
angular.module('waitForAuth', [])

/**
 * A service that returns a promise object, which is resolved once angularFireAuth
 * is initialized (i.e. it returns login, logout, or error)
 */
   .service('waitForAuth', function($rootScope, $q, $timeout) {
      var def = $q.defer(), subs = [];
      subs.push($rootScope.$on('angularFireAuth:login', fn));
      subs.push($rootScope.$on('angularFireAuth:logout', fn));
      subs.push($rootScope.$on('angularFireAuth:error', fn));
      function fn() {
         for(var i=0; i < subs.length; i++) { subs[i](); }
         $timeout(function() {
            // force $scope.$apply to be re-run after login resolves
            def.resolve();
         });
      }
      return def.promise;
   })

/**
 * A directive that hides the element from view until waitForAuth resolves
 */
   .directive('ngCloakAuth', function(waitForAuth) {
      return {
         restrict: 'A',
         compile: function(el) {
            console.log('waiting');
            el.addClass('hide');
            waitForAuth.then(function() {
               el.removeClass('hide');
            })
         }
      }
   })

/**
 * A directive that shows elements only when the given authentication state is in effect
 */
   .directive('ngShowAuth', function($rootScope) {
      var loginState;
      return {
         restrict: 'A',
         compile: function(el, attr) {
            var expState = attr.ngShowAuth;
            function fn(newState) {
               loginState = newState;
               el.toggleClass('hide', loginState !== expState );
            }
            fn(null);
            $rootScope.$on("angularFireAuth:login",  function() { fn('login') });
            $rootScope.$on("angularFireAuth:logout", function() { fn('logout') });
            $rootScope.$on("angularFireAuth:error",  function() { fn('error') });
         }
      }
   });