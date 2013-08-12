'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

angular.scenario.dsl('angularFireLogin', function() {
   return function() {
      return this.addFutureAction('Logging in', function($window, $document, done) {
         var angularFireAuth = $document.injector().get('angularFireAuth');
         return angularFireAuth.login('password', {
            email: 'test@test.com',
            password: 'test123',
            rememberMe: false
         }).then(function(user) {
               done(null, user);
            }, function(err) {
               done(err);
            });
      });
   }
});

angular.scenario.dsl('angularFireLogout', function() {
   return function() {
      this.addFutureAction('Logging out', function($window, $document, done) {
         var angularFireAuth = $document.injector().get('angularFireAuth');
         angularFireAuth.logout();
         done(null, true);
      });
   }
});

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

   describe('account', function() {
      afterEach(function() {
         angularFireLogout();
      });

      it('should redirect to /login if not logged in', function() {
         browser().navigateTo('#/account');
         expect(browser().window().hash()).toBe('/login');
      });

      it('should stay on account screen if authenticated', function() {
         expect(angularFireLogin()).toBeTruthy();
         browser().navigateTo('#/account');
         expect(browser().window().hash()).toBe('/account');
      });
   });

   describe('login', function() {
      beforeEach(function() {
         browser().navigateTo('#/login');
      });

      afterEach(function() {
         angularFireLogout();
      });

      it('should render login when user navigates to /login', function() {
         expect(element('[ng-view] h2:first').text()).toMatch('Login Page');
      });

      it('should show error if no email', function() {
         expect(element('p.error').text()).toEqual('');
         input('pass').enter('test123');
         element('button[ng-click="login()"]').click();
         expect(element('p.error').text()).not().toEqual('')
      });

      it('should show error if no password', function() {
         expect(element('p.error').text()).toEqual('');
         input('email').enter('test@test.com');
         element('button[ng-click="login()"]').click();
         expect(element('p.error').text()).not().toEqual('')
      });

      it('should log in with valid fields', function() {
         input('email').enter('test@test.com');
         input('pass').enter('test123');
         element('button[ng-click="login()"]').click();
         expect(element('p.error').text()).toEqual('');
      });
   });
});
