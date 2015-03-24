
describe('myApp.home', function() {
  beforeEach(module('myApp.home'));

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

    it('assigns user in scope', function() {
      expect(typeof $scope.user).toBe('object');
      expect($scope.user.uid).toBe('test123');
    });
  });
});