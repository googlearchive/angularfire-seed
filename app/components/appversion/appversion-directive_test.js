'use strict';

/* jasmine specs for directives go here */

describe('app-version directive', function() {
  beforeEach(function() {
    module('mock.firebase');
    module('myApp');
  });

  it('should print current version', function() {
    module(function($provide) {
      $provide.constant('version', 'TEST_VER');
    });
    inject(function($compile, $rootScope) {
      var element = $compile('<span app-version></span>')($rootScope);
      expect(element.text()).toEqual('TEST_VER');
    });
  });

});