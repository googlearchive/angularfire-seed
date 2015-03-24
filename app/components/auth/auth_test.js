"use strict";
describe('Auth', function() {
  beforeEach(function() {
    module('mock.firebase');
    module('firebase.auth');
  });

  it('should return $firebaseAuth instance', function() {
    inject(function (Auth, $firebaseAuth) {
      var ref = new MockFirebase();
      var testInst = $firebaseAuth(ref);
      expect(Auth.prototype === testInst.prototype).toBe(true);
    });
  });
});