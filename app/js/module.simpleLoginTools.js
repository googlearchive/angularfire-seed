'use strict';

/**
 * This module monitors angularFire's authentication and performs actions based on authentication state.
 * directives/directive.ngcloakauth.js depends on this file
 *
 * Modify ng-cloak to hide content until FirebaseSimpleLogin resolves. Also
 * provides ng-show-auth methods for displaying content only when certain login
 * states are active.
 *
 * Just like other ng-cloak ops, this works best if you put the following into your CSS:
 [ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
        display: none !important;
   }
 *
 * See usage examples here: https://gist.github.com/katowulf/7328023
 */
angular.module('simpleLoginTools', [])

/**
 * A service that returns a promise object, which is resolved once $firebaseSimpleLogin
 * is initialized.
 *
 * <code>
 *    function(waitForAuth) {
 *        waitForAuth.then(function() {
 *            console.log('auth initialized');
 *        });
 *    }
 * </code>
 */
  .service('waitForAuth', function($rootScope, $q, $timeout) {
    function fn(err) {
      if($rootScope.auth) {
        $rootScope.auth.error = err instanceof Error? err.toString() : null;
      }
      for(var i=0; i < subs.length; i++) { subs[i](); }
      $timeout(function() {
        // force $scope.$apply to be re-run after login resolves
        def.resolve();
      });
    }

    var def = $q.defer(), subs = [];
    subs.push($rootScope.$on('$firebaseSimpleLogin:login', fn));
    subs.push($rootScope.$on('$firebaseSimpleLogin:logout', fn));
    subs.push($rootScope.$on('$firebaseSimpleLogin:error', fn));
    return def.promise;
  })

/**
 * A directive that wraps ng-cloak so that, instead of simply waiting for Angular to compile, it waits until
 * waitForAuth resolves (in other words, until the user's login status resolves via Firebase)
 *
 * <code>
 *    <div ng-cloak>Authentication has resolved.</div>
 * </code>
 */
  .config(function($provide) {
    // adapt ng-cloak to wait for auth before it does its magic
    $provide.decorator('ngCloakDirective', function($delegate, waitForAuth) {
      var directive = $delegate[0];
      // make a copy of the old directive
      var _compile = directive.compile;
      directive.compile = function(element, attr) {
        waitForAuth.then(function() {
          // after auth, run the original ng-cloak directive
          _compile.call(directive, element, attr);
        });
      };
      // return the modified directive
      return $delegate;
    });
  })

/**
 * A directive that shows elements only when the given authentication state is in effect
 *
 * <code>
 *    <div ng-show-auth="login">{{auth.user.id}} is logged in</div>
 *    <div ng-show-auth="logout">Logged out</div>
 *    <div ng-show-auth="error">An error occurred: {{auth.error}}</div>
 *    <div ng-show-auth="logout,error">This appears for logout or for error condition!</div>
 * </code>
 */
  .directive('ngShowAuth', function ($rootScope) {
    var loginState = 'logout';
    $rootScope.$on('$firebaseSimpleLogin:login',  function() { loginState = 'login'; });
    $rootScope.$on('$firebaseSimpleLogin:logout', function() { loginState = 'logout'; });
    $rootScope.$on('$firebaseSimpleLogin:error',  function() { loginState = 'error'; });

    function getExpectedState(scope, attr) {
      var expState = scope.$eval(attr);
      if( typeof(expState) !== 'string' && !angular.isArray(expState) ) {
        expState = attr;
      }
      if( typeof(expState) === 'string' ) {
        expState = expState.split(',');
      }
      return expState;
    }

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

    function assertValidStates(states) {
      if( !states.length ) {
        throw new Error('ng-show-auth directive must be login, logout, or error (you may use a comma-separated list)');
      }
      angular.forEach(states, function(s) {
        if( !inList(s, ['login', 'logout', 'error']) ) {
          throw new Error('Invalid state "'+s+'" for ng-show-auth directive, must be one of login, logout, or error');
        }
      });
      return true;
    }

    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        var expState = getExpectedState(scope, attr.ngShowAuth);
        assertValidStates(expState);
        function fn() {
          var show = inList(loginState, expState);
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          setTimeout(function() {
            el.toggleClass('ng-cloak', !show);
          }, 0);
        }
        fn();
        $rootScope.$on('$firebaseSimpleLogin:login',  fn);
        $rootScope.$on('$firebaseSimpleLogin:logout', fn);
        $rootScope.$on('$firebaseSimpleLogin:error',  fn);
      }
    };
  });