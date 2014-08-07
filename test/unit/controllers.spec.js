'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(function() {
    module('mock.firebase');
    module('myApp.controllers');
  });

  describe('HomeCtrl', function() {
    var homeCtrl, $scope;
    beforeEach(function() {
      module(function($provide) {
        // comes from routes.js in the resolve: {} attribute
        $provide.value('user', {uid: 'test123'});
      });
      inject(function($controller) {
        $scope = {};
        homeCtrl = $controller('HomeCtrl', {$scope: $scope});
      });
    });

    it('should create user in scope', function() {
      expect($scope.user).toBeDefined();
    });
  });

  describe('LoginCtrl', function() {
    var loginCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        loginCtrl = $controller('LoginCtrl', {$scope: $scope});
      })
    });

    it('should define login function', function() {
      expect($scope.login).toBeA('function');
    });

    it('should define createAccount function', function() {
      expect($scope.createAccount).toBeA('function');
    });
  });

  describe('AccountCtrl', function() {
    var acctCtrl, $scope;
    beforeEach(function() {
      module(function($provide) {
        // comes from routes.js in the resolve: {} attribute
        $provide.value('user', {uid: 'test123'});
      });
      inject(function($controller) {
        $scope = {};
        acctCtrl = $controller('AccountCtrl', {$scope: $scope});
      })
    });

    it('should define logout method', function() {
      expect($scope.logout).toBeA('function');
    });

    it('should define changePassword method', function() {
      expect($scope.changePassword).toBeA('function');
    });

    it('should define changeEmail method', function() {
      expect($scope.changeEmail).toBeA('function');
    });

    it('should define clear method', function() {
      expect($scope.clear).toBeA('function');
    });
  });
});
