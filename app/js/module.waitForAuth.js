/**
 * This module monitors angularFire's authentication and performs actions based on authentication state.
 *
 * See usage examples here: https://gist.github.com/katowulf/7328023
 */
angular.module('waitForAuth', [])

/**
 * A service that returns a promise object, which is resolved once $firebaseSimpleLogin
 * is initialized (i.e. it returns login, logout, or error)
 */
   .service('waitForAuth', function($rootScope, $q, $timeout) {
      var def = $q.defer(), subs = [];
      subs.push($rootScope.$on('$firebaseSimpleLogin:login', fn));
      subs.push($rootScope.$on('$firebaseSimpleLogin:logout', fn));
      subs.push($rootScope.$on('$firebaseSimpleLogin:error', fn));
      function fn(err) {
         if( $rootScope.auth ) {
            $rootScope.auth.error = err instanceof Error? err.toString() : null;
         }
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
      $rootScope.$on("$firebaseSimpleLogin:login",  function() { loginState = 'login' });
      $rootScope.$on("$firebaseSimpleLogin:logout", function() { loginState = 'logout' });
      $rootScope.$on("$firebaseSimpleLogin:error",  function() { loginState = 'error' });
      function inList(needle, list) {
         var res = false;
         angular.forEach(list, function(x) {
            if( x === needle ) {
               res = true;
               return true;
            }
            return false;
         });
         return res;
      }
      function assertValidState(state) {
         if( !state ) {
            throw new Error('ng-show-auth directive must be login, logout, or error (you may use a comma-separated list)');
         }
         var states = (state||'').split(',');
         angular.forEach(states, function(s) {
            if( !inList(s, ['login', 'logout', 'error']) ) {
               throw new Error('Invalid state "'+s+'" for ng-show-auth directive, must be one of login, logout, or error');
            }
         });
         return true;
      }
      return {
         restrict: 'A',
         compile: function(el, attr) {
            assertValidState(attr.ngShowAuth);
            var expState = (attr.ngShowAuth||'').split(',');
            function fn(newState) {
               loginState = newState;
               var hide = !inList(newState, expState);
               el.toggleClass('hide', hide );
            }
            fn(loginState);
            $rootScope.$on("$firebaseSimpleLogin:login",  function() { fn('login') });
            $rootScope.$on("$firebaseSimpleLogin:logout", function() { fn('logout') });
            $rootScope.$on("$firebaseSimpleLogin:error",  function() { fn('error') });
         }
      }
   });