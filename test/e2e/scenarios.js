'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
describe('my app', function() {

  browser.get('index.html');

  it('should automatically redirect to /home when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/home");
  });

  describe('home', function() {

    beforeEach(function() {
      browser.get('index.html#/home');
    });


    it('should render home when user navigates to /home', function() {
      expect(element.all(by.css('[ng-view] h2')).first().getText()).
        toMatch(/Home/);
    });

  });


  describe('chat', function() {
     beforeEach(function() {
        browser.get('index.html#/chat');
     });

     it('should render chat when user navigates to /chat', function() {
       expect(element.all(by.css('[ng-view] h2')).first().getText()).
         toMatch(/Chat/);
     });
  });

   describe('account', function() {
      it('should redirect to /login if not logged in', function() {
         browser.get('index.html#/account');
         expect(browser.getLocationAbsUrl()).toMatch('/login');
      });

      //todo https://github.com/firebase/angularFire-seed/issues/41
   });

   describe('login', function() {
      beforeEach(function() {
         browser.get('index.html#/login');
      });

      it('should render login when user navigates to /login', function() {
         expect(element.all(by.css('[ng-view] h2')).first().getText()).toMatch(/Login Page/);
      });

//
//      afterEach(function() {
//         angularFireLogout();
//      });
//

      //todo https://github.com/firebase/angularFire-seed/issues/41
//
//      it('should show error if no email', function() {
//         expect(element('p.error').text()).toEqual('');
//         input('email').enter('');
//         input('pass').enter('test123');
//         element('button[ng-click="login()"]').click();
//         expect(element('p.error').text()).not().toEqual('');
//      });
//
//      it('should show error if no password', function() {
//         expect(element('p.error').text()).toEqual('');
//         input('email').enter('test@test.com');
//         input('pass').enter('');
//         element('button[ng-click="login()"]').click();
//         expect(element('p.error').text()).not().toEqual('')
//      });
//
//      it('should log in with valid fields', function() {
//         input('email').enter('test@test.com');
//         input('pass').enter('test123');
//         element('button[ng-click="login()"]').click();
//         expect(element('p.error').text()).toEqual('');
//      });
   });
});
