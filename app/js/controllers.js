'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
   .controller('MyCtrl1', [function() { }])

  .controller('MyCtrl2', [function() { }])

   .controller('LoginCtrl', ['$scope', 'loginService', function($scope, loginService) {
      $scope.email = 'katowulf@gmail.com'; //null;
      $scope.pass = '123'; //null;

//      loginService.redirectOnLogin('/account', true);

      $scope.login = function() {
         $scope.err = null;
         loginService.login($scope.email, $scope.pass, '/account', function(err) {
            console.log('it had an error', err); //debug
            $scope.err = err;
         });
      };

      $scope.newAccount = function() {
         console.log('newAccount'); //debug
      };
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'angularFire', 'FBURL', '$timeout', function($scope, loginService, angularFire, FBURL, $timeout) {

      angularFire(FBURL+'/users/'+$scope.auth.id, $scope, 'user', {});

      $scope.logout = function() {
         console.log('logging out'); //debug
         loginService.logout('/login');
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      function reset() {
         $scope.err = null;
         $scope.msg = null;
      }

      $scope.updatePassword = function() {
         console.log('updating pass', $scope.auth); //debug
         reset();
         loginService.changePassword(buildPwdParms());
      };

      $scope.$watch('oldpass', reset);
      $scope.$watch('newpass', reset);
      $scope.$watch('confirm', reset);

      function buildPwdParms() {
         return {
            email: $scope.auth.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               console.log('updated', err); //debug
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);