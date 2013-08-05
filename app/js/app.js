'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',
      ['myApp.config', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'firebase']
   )
   .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/view1', {
         templateUrl: 'partials/view1.html',
         controller: 'MyCtrl1'
      });

      $routeProvider.when('/view2', {
         templateUrl: 'partials/view2.html',
         controller: 'MyCtrl2'
      });

      $routeProvider.when('/account', {
         authRequired: true,
         templateUrl: 'partials/account.html',
         controller: 'AccountCtrl'
      });

      $routeProvider.when('/login', {
         templateUrl: 'partials/login.html',
         controller: 'LoginCtrl'
      });

      $routeProvider.otherwise({redirectTo: '/view1'});
   }])

   // double-check that the app has been configured
   .run(['FBURL', function(FBURL) {
      if( FBURL === 'http://INSTANCE.firebaseio.com' ) {
         angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
      }
   }])

   // establish authentication
   .run(['angularFireAuth', 'FBURL', '$rootScope', function(angularFireAuth, FBURL, $rootScope) {
      angularFireAuth.initialize(FBURL, {scope: $rootScope, name: "auth", path: '/login'});

      $rootScope.$on("angularFireAuth:login", function(evt, user) {
         console.log('user logged in', user); //debug
      });
      $rootScope.$on("angularFireAuth:logout", function(evt) {
         console.log('user logged out'); //debug
      });
      $rootScope.$on("angularFireAuth:error", function(evt, err) {
         console.log('login error', err); //debug
      });
   }]);