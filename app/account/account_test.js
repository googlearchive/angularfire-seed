
describe('myApp.account', function() {
  beforeEach(function() {
    module('myApp');
    module('myApp.account');
  });

  describe('AccountCtrl', function() {
    var accountCtrl, $scope;
    beforeEach(function() {
      module(function($provide) {
        // comes from routes.js in the resolve: {} attribute
        $provide.value('user', {uid: 'test123'});
      });

      inject(function($controller) {
        $scope = {};
        accountCtrl = $controller('AccountCtrl', {$scope: $scope});
      });
    });

    it('should define logout method', function() {
      expect(typeof $scope.logout).toBe('function');
    });

    it('should define changePassword method', function() {
      expect(typeof $scope.changePassword).toBe('function');
    });

    it('should define changeEmail method', function() {
      expect(typeof $scope.changeEmail).toBe('function');
    });

    it('should define clear method', function() {
      expect(typeof $scope.clear).toBe('function');
    });
  });
});