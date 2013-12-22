'use strict';

/* jasmine specs for services go here */

describe('service', function() {
   beforeEach(module('myApp.services'));

   describe('loginService', function() {
      beforeEach(module(function($provide) {
         // mock dependencies used by our services to isolate testing
         $provide.value('Firebase', firebaseStub());
         $provide.value('$location', stub('path'));
         $provide.value('$firebaseAuth', angularAuthStub());
         $provide.value('firebaseRef', firebaseStub());
      }));

      describe('#login', function() {
         it('should return error if $firebaseAuth.$login fails',
            inject(function($q, $rootScope, loginService, $firebaseAuth) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               $firebaseAuth.fns.$login.andReturn(reject($q, 'test_error'));
               loginService.login('test@test.com', '123', cb);
               $rootScope.$apply();
               expect(cb).toHaveBeenCalledWith('test_error');
            })
         );

         it('should return user if $firebaseAuth.$login succeeds',
            inject(function(loginService, $firebaseAuth, $rootScope, $q) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               $firebaseAuth.fns.$login.andReturn(resolve($q, {hello: 'world'}));
               loginService.login('test@test.com', '123', cb);
               $rootScope.$apply();
               expect(cb).toHaveBeenCalledWith(null, {hello: 'world'});
            })
         );
      });

      describe('#logout', function() {
         it('should invoke $firebaseAuth.$logout()', function() {
            inject(function(loginService, $firebaseAuth) {
               loginService.init('/login');
               loginService.logout();
               expect($firebaseAuth.fns.$logout).toHaveBeenCalled();
            });
         });
      });

      describe('#changePassword', function() {
         beforeEach(inject(function($timeout, $firebaseAuth) {
            customSpy($firebaseAuth.fns, '$changePassword', function(eml, op, np, cb) { $timeout(function() { cb(null); }) });
         }));

         it('should fail if old password is missing',
            inject(function(loginService, $firebaseAuth, $timeout) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               loginService.changePassword({
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               flush($timeout);
               expect(cb).toHaveBeenCalledWith('Please enter a password');
               expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if new password is missing',
            inject(function(loginService, $firebaseAuth, $timeout) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               loginService.changePassword({
                  oldpass: 123,
                  confirm: 123,
                  callback: cb
               });
               flush($timeout);
               expect(cb).toHaveBeenCalledWith('Please enter a password');
               expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if passwords don\'t match',
            inject(function(loginService, $firebaseAuth, $timeout) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               loginService.changePassword({
                  oldpass: 123,
                  newpass: 123,
                  confirm: 124,
                  callback: cb
               });
               flush($timeout);
               expect(cb).toHaveBeenCalledWith('Passwords do not match');
               expect($firebaseAuth.fns.$changePassword).not.toHaveBeenCalled();
            })
         );

         it('should fail if $firebaseAuth fails',
            inject(function(loginService, $firebaseAuth, $timeout) {
               var cb = jasmine.createSpy();
               customSpy($firebaseAuth.fns, '$changePassword', function(email, op, np, cb) {
                  cb(new ErrorWithCode(123, 'errr'));
               });
               loginService.init('/login');
               loginService.changePassword({
                  oldpass: 124,
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               flush($timeout);
               expect(cb.argsForCall[0][0].toString()).toBe('errr');
               expect($firebaseAuth.fns.$changePassword).toHaveBeenCalled();
            })
         );

         it('should return null if $firebaseAuth succeeds',
            inject(function(loginService, $firebaseAuth, $timeout) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               loginService.changePassword({
                  oldpass: 124,
                  newpass: 123,
                  confirm: 123,
                  callback: cb
               });
               flush($timeout);
               expect(cb).toHaveBeenCalledWith(null);
               expect($firebaseAuth.fns.$changePassword).toHaveBeenCalled();
            })
         );
      });

      describe('#createAccount', function() {
         beforeEach(inject(function($timeout, $firebaseAuth) {
            customSpy($firebaseAuth.fns, '$createUser', function(eml, pass, cb) { $timeout(function() { cb(null); }) });
         }));

         it('should invoke $firebaseAuth',
            inject(function(loginService, $firebaseAuth) {
               loginService.init('/login');
               loginService.createAccount('test@test.com', 123);
               expect($firebaseAuth.fns.$createUser).toHaveBeenCalled();
            })
         );

         it('should invoke callback if error',
            inject(function(loginService, $timeout, $firebaseAuth) {
               var cb = jasmine.createSpy(), undefined;
               customSpy($firebaseAuth.fns, '$createUser', function(email, pass, cb) {
                  cb('joy!');
               });
               loginService.init('/login');
               loginService.createAccount('test@test.com', 123, cb);
               flush($timeout);
               expect(cb).toHaveBeenCalledWith('joy!');
            })
         );

         it('should invoke callback if success',
            inject(function(loginService, $timeout) {
               var cb = jasmine.createSpy();
               loginService.init('/login');
               loginService.createAccount('test@test.com', 123, cb);
               flush($timeout);
               expect(cb).toHaveBeenCalledWith(null);
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
      beforeEach(module(function($provide) {
         // mock dependencies used by our services to isolate testing
         $provide.value('Firebase', firebaseStub());
         $provide.value('$location', stub('path'));
         $provide.value('$firebaseAuth', angularAuthStub());
         $provide.value('firebaseRef', firebaseStub());
      }));

      it('should invoke set on Firebase',
         inject(function(profileCreator, firebaseRef, $timeout) {
            profileCreator(123, 'test@test.com');
            flush($timeout);
            expect(firebaseRef.fns.set.argsForCall[0][0]).toEqual({email: 'test@test.com', name: 'Test'});
         })
      );

      it('should invoke the callback',
         inject(function(profileCreator, $timeout) {
            var cb = jasmine.createSpy();
            profileCreator(456, 'test2@test2.com', cb);
            flush($timeout);
            expect(cb).toHaveBeenCalled();
         })
      );

      it('should return any error in the callback',
         inject(function(profileCreator, firebaseRef, $timeout) {
            var cb = jasmine.createSpy();
            firebaseRef.fns.callbackVal = 'noooooo';
            profileCreator(456, 'test2@test2.com', cb);
            flush($timeout);
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
      var FirebaseStub = function() {
         return FirebaseStub.fns;
      };
      FirebaseStub.fns = { callbackVal: null };
      customSpy(FirebaseStub.fns, 'set', function(value, cb) { cb && cb(FirebaseStub.fns.callbackVal); });
      customSpy(FirebaseStub.fns, 'child', function() { return FirebaseStub.fns; });
      return FirebaseStub;
   }

   function angularAuthStub() {
      function AuthStub() { return AuthStub.fns; }
      AuthStub.fns = stub('$login', '$logout');
      return AuthStub;
   }

   function customSpy(obj, m, fn) {
      obj[m] = fn;
      spyOn(obj, m).andCallThrough();
   }

   function flush($timeout) {
      try { $timeout.flush(); }
      catch(e) {} // is okay
   }

   function ErrorWithCode(code, msg) {
      this.code = code;
      this.msg = msg;
   }
   ErrorWithCode.prototype.toString = function() { return this.msg; }
});
