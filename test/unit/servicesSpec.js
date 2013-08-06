'use strict';

/* jasmine specs for services go here */

describe('service', function() {
   beforeEach(module('myApp.services'));

   beforeEach(module(function($provide) {
      $provide.value('Firebase', firebaseStub());
      $provide.value('$location', stub('path'));
      $provide.value('FBURL', 'FAKE_FB_URL');
      $provide.value('angularFireAuth', angularAuthStub());
   }));

   describe('loginService', function() {
      describe('#login', function() {
         it('should return error if angularFireAuth.login fails',
            inject(function($q, $rootScope, loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               angularFireAuth.login.andReturn(reject($q, 'test_error'));
               loginService.login('test@test.com', '123', null, cb);
               $rootScope.$apply();
               expect(cb).toHaveBeenCalledWith('test_error');
            })
         );

         it('should return user if angularFireAuth.login succeeds',
            inject(function(loginService, angularFireAuth, $rootScope, $q) {
               var cb = jasmine.createSpy();
               angularFireAuth.login.andReturn(resolve($q, {hello: 'world'}));
               loginService.login('test@test.com', '123', null, cb);
               $rootScope.$apply();
               expect(cb).toHaveBeenCalledWith(null, {hello: 'world'});
            })
         );

         it('should invoke the redirect if angularFireAuth.login succeeds',
            inject(function(loginService, angularFireAuth, $rootScope, $location, $q) {
               angularFireAuth.login.andReturn(resolve($q, {hello: 'world'}));
               loginService.login('test@test.com', '123', '/hello');
               $rootScope.$apply();
               expect($location.path).toHaveBeenCalledWith('/hello');
            })
         );

         it('should not invoke the redirect if angularFireAuth.login fails',
            inject(function(loginService, angularFireAuth, $rootScope, $location, $q) {
               angularFireAuth.login.andReturn(reject($q, 'Nooooooo!'));
               loginService.login('test@test.com', '123', '/hello');
               $rootScope.$apply();
               expect($location.path).not.toHaveBeenCalled();
            })
         )
      });

      describe('#logout', function() {
         it('should invoke angularFireAuth.logout()', function() {
            inject(function(loginService, angularFireAuth) {
               loginService.logout('/bye');
               expect(angularFireAuth.logout).toHaveBeenCalled();
            });
         });

         it('should invoke redirect after calling logout', function() {
            inject(function(loginService, angularFireAuth, $rootScope, $location) {
               loginService.logout('/bye');
               expect($location.path).toHaveBeenCalledWith('/bye');
            });
         });
      });

      describe('#changePassword', function() {
         it('should fail if old password is missing',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               loginService.changePassword({
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               expect(cb).toHaveBeenCalledWith('Please enter a password');
               expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if new password is missing',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               loginService.changePassword({
                  oldpass: 123,
                  confirm: 123,
                  callback: cb
               });
               expect(cb).toHaveBeenCalledWith('Please enter a password');
               expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if passwords don\'t match',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               loginService.changePassword({
                  oldpass: 123,
                  newpass: 123,
                  confirm: 124,
                  callback: cb
               });
               expect(cb).toHaveBeenCalledWith('Passwords do not match');
               expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if angularFireAuth fails',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               customSpy(angularFireAuth._authClient, 'changePassword', function(oldp, newp, confp, cb) {
                  cb(new ErrorWithCode(123, 'errr'));
               });
               loginService.changePassword({
                  oldpass: 124,
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               expect(cb).toHaveBeenCalledWith('[123] errr');
               expect(angularFireAuth._authClient.changePassword).toHaveBeenCalled();
            })
         );

         it('should return null if angularFireAuth succeeds',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               customSpy(angularFireAuth._authClient, 'changePassword', function(oldp, newp, confp, cb) {
                  cb(null);
               });
               loginService.changePassword({
                  oldpass: 124,
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               expect(cb).toHaveBeenCalledWith(null);
               expect(angularFireAuth._authClient.changePassword).toHaveBeenCalled();
            })
         );
      });

      describe('#createAccount', function() {
         it('should invoke angularFireAuth',
            inject(function(loginService, angularFireAuth) {
               loginService.createAccount('test@test.com', 123);
               expect(angularFireAuth._authClient.createUser).toHaveBeenCalled();
            })
         );

         it('should invoke callback if error',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy(), undefined;
               customSpy(angularFireAuth._authClient, 'createUser', function(e, p, cb) {
                  cb('errr');
               });
               loginService.createAccount('test@test.com', 123, cb);
               expect(cb).toHaveBeenCalledWith('errr', undefined);
            })
         );

         it('should invoke callback if success',
            inject(function(loginService, angularFireAuth) {
               var cb = jasmine.createSpy();
               customSpy(angularFireAuth._authClient, 'createUser', function(e, p, cb) {
                  cb(null, 'oh hai!');
               });
               loginService.createAccount('test@test.com', 123, cb);
               expect(cb).toHaveBeenCalledWith(null, 'oh hai!');
            })
         )
      });

      describe('#createProfile', function() {
         it('should be the createProfile service',
            inject(function(loginService, profileCreator) {
               expect(loginService.createProfile).toBe(profileCreator);
            })
         );
      });
   });

   describe('profileCreator', function() {
      it('should invoke set on Firebase',
         inject(function(profileCreator, Firebase) {
            profileCreator(123, 'test@test.com');
            expect(Firebase.fns.set.argsForCall[0][0]).toEqual({email: 'test@test.com', name: 'Test'});
         })
      );

      it('should invoke the callback', function() {
         inject(function(profileCreator, Firebase) {
            var cb = jasmine.createSpy();
            customSpy(Firebase.fns, 'set', function(val, cb) { cb(); });
            profileCreator(456, 'test2@test2.com', cb);
            expect(cb).toHaveBeenCalled();
         })
      });

      it('should return any error in the callback',
         inject(function(profileCreator, Firebase) {
            var cb = jasmine.createSpy();
            customSpy(Firebase.fns, 'set', function(val, cb) { cb('noooooo'); });
            profileCreator(456, 'test2@test2.com', cb);
            expect(cb).toHaveBeenCalledWith('noooooo');
         })
      );
   });

   function stub() {
      var out = {};
      angular.forEach(arguments, function(m) {
         out[m] = jasmine.createSpy();
      });
      return out;
   }

   function reject($q, error) {
      var def = $q.defer();
      def.reject(error);
      return def.promise;
   }

   function resolve($q, val) {
      var def = $q.defer();
      def.resolve(val);
      return def.promise;
   }

   function firebaseStub() {
      // firebase is invoked using new Firebase, but we need a static ref
      // to the functions before it is instantiated, so we cheat here by
      // attaching the functions as Firebase.fns, and ignore new (we don't use `this` or `prototype`)
      var fns = stub('set');
      customSpy(fns, 'child', function() { return fns; });

      var Firebase = function() {
         angular.extend(this, fns);
         return fns;
      };
      Firebase.fns = fns;

      return Firebase;
   }

   function angularAuthStub() {
      var auth = stub('login', 'logout', 'createAccount', 'changePassword');
      auth._authClient = stub('changePassword', 'createUser');
      return auth;
   }

   function customSpy(obj, m, fn) {
      obj[m] = fn;
      spyOn(obj, m).andCallThrough();
   }

   function ErrorWithCode(code, msg) {
      this.code = code;
      this.msg = msg;
   }
   ErrorWithCode.prototype.toString = function() { return this.msg; }
});
