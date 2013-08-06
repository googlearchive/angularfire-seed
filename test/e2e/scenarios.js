'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });


  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/view1");
  });


  describe('view1', function() {

    beforeEach(function() {
      browser().navigateTo('#/view1');
    });


    it('should render view1 when user navigates to /view1', function() {
      expect(element('[ng-view] h2:first').text()).
        toMatch(/View 1/);
    });

  });


  describe('view2', function() {
    beforeEach(function() {
      browser().navigateTo('#/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element('[ng-view] h2:first').text()).
        toMatch(/View 2/);
    });

  });

   describe('login', function() {
      beforeEach(function($provide) {
         console.log('$provide', $provide); //debug
         browser().navigateTo('#/login');
      });

      it('should render login when user navigates to /login', function() {
         expect(element('[ng-view] h2:first').text()).toMatch('Login Page');
      });

      it('should reveal the confirm password box when "create account" is clicked', function() {

      });

      it('should redirect to /account after login success', function() {

         //element('[ng-view] input[ng-model="email"]').val('test@test.com');

      });
   });
});
