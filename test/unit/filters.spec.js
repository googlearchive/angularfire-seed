'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('myApp.filters'));


  describe('interpolate', function() {
    beforeEach(module(function($provide) {
      $provide.value('version', 'TEST_VER');
    }));


    it('should replace VERSION', inject(function(interpolateFilter) {
      expect(interpolateFilter('before %VERSION% after')).toEqual('before TEST_VER after');
    }));
  });

  describe('reverse', function() {
    var reverse;
    beforeEach(inject(function(reverseFilter) {
      reverse = reverseFilter;
    }));

    it('should reverse contents of an array', function() {
      expect(reverse([3,2,1])).toEqual([1,2,3]);
    });
  })
});
