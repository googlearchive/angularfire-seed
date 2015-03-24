'use strict';

/* verify config settings are present */

describe('config', function() {
  beforeEach(module('myApp.config'));

  it('should have a valid FBURL', inject(function(FBURL) {
    expect(FBURL).toMatch(/^https:\/\/[a-zA-Z0-9_-]+\.firebaseio\.com$/i);
  }));

  it('should have a valid SEMVER version', inject(function(version) {
    expect(version).toMatch(/^\d\d*(\.\d+)+$/);
  }));
});
