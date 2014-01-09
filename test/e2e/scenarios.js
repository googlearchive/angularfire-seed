'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

angular.scenario.dsl('angularFireLogout', function() {
   return function() {
      this.addFutureAction('Logging out', function($window, $document, done) {
         var fbRef = $document.injector().get('firebaseRef');
         var $firebaseAuth = $document.injector().get('$firebaseSimpleLogin');
         $firebaseAuth(fbRef()).$logout();
         done(null, true);
      });
   }
});

describe('my app', function() {

  beforeEach(function() {
     browser().navigateTo('../../app/index.html');
//     this.addFutureAction('authenticate', function($window, $document, done) {
//        $document.injector().get('waitForAuth').then(done);
//     });
  });


  it('should automatically redirect to /home when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/home");
  });


  describe('home', function() {

    beforeEach(function() {
      browser().navigateTo('#/home');
    });


    it('should render home when user navigates to /home', function() {
      expect(element('[ng-view] h2:first').text()).
        toMatch(/Home/);
    });

  });


  describe('chat', function() {
     beforeEach(function() {
        browser().navigateTo('#/chat');
     });

     it('should render chat when user navigates to /chat', function() {
        expect(element('[ng-view] h2:first').text()).
           toMatch(/Chat/);
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
         this.addFutureAction('authenticate', function($window, $document, done) {
            var loginService = $document.injector().get('loginService');
            loginService.login('test@test.com', 'test123', done);
         });
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
         input('email').enter('');
         input('pass').enter('test123');
         element('button[ng-click="login()"]').click();
         expect(element('p.error').text()).not().toEqual('');
      });

      it('should show error if no password', function() {
         expect(element('p.error').text()).toEqual('');
         input('email').enter('test@test.com');
         input('pass').enter('');
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
