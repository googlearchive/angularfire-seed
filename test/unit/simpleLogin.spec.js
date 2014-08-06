"use strict";
describe('simpleLogin', function() {
  var $q, Firebase;
  beforeEach(function() {
    MockFirebase.override();
    module('simpleLogin');
    module(function($provide) {
      // mock dependencies used by our services to isolate testing
      $provide.value('$location', stub('path'));
      $provide.value('fbutil', fbutilStub());
    });
    inject(function(_$q_) {
      $q = _$q_;
    });
  });

  describe('#login', function() {
    it('should return error if $firebaseSimpleLogin.$login fails',
      inject(function($q, $timeout, simpleLogin, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        $firebaseSimpleLogin.fns.$login.andReturn(reject($q, 'test_error'));
        simpleLogin.login('test@test.com', '123', cb);
        flush($timeout);
        expect(cb).toHaveBeenCalledWith('test_error');
      })
    );

    it('should return user if $firebaseSimpleLogin.$login succeeds',
      inject(function(simpleLogin, $firebaseSimpleLogin, $q, $timeout) {
        var cb = jasmine.createSpy();
        runs(function() {
          $firebaseSimpleLogin.fns.$login.andReturn(resolve($q, {hello: 'world'}));
          simpleLogin.login('test@test.com', '123', cb);
          flush($timeout);
        });

        waitsFor(function() {
          return cb.callCount > 0;
        });

        runs(function() {
          expect(cb).toHaveBeenCalledWith(null, {hello: 'world'});
        });
      })
    );
  });

  describe('#logout', function() {
    it('should invoke $firebaseSimpleLogin.$logout()', function() {
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        simpleLogin.init('/login');
        simpleLogin.logout();
        expect($firebaseSimpleLogin.fns.$logout).toHaveBeenCalled();
      });
    });
  });

  describe('#changePassword', function() {
    beforeEach(inject(function($timeout, $firebaseSimpleLogin, $q) {
      customSpy($firebaseSimpleLogin.fns, '$changePassword',
        function(eml, op, np, cb) {
          var def = $q.defer();
          $timeout(function() { def.resolve(); });
          return def.promise;
        });
    }));

    it('should fail if old password is missing',
      inject(function(simpleLogin, $firebaseSimpleLogin, $timeout) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          newpass: 123,
          confirm: 123,
          callback: cb
        });
        flush($timeout);
        expect(cb).toHaveBeenCalledWith('Please enter a password');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if new password is missing',
      inject(function(simpleLogin, $firebaseSimpleLogin, $timeout) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 123,
          confirm: 123,
          callback: cb
        });
        flush($timeout);
        expect(cb).toHaveBeenCalledWith('Please enter a password');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if passwords don\'t match',
      inject(function(simpleLogin, $firebaseSimpleLogin, $timeout) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 123,
          newpass: 123,
          confirm: 124,
          callback: cb
        });
        flush($timeout);
        expect(cb).toHaveBeenCalledWith('Passwords do not match');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if $firebaseSimpleLogin fails',
      inject(function(simpleLogin, $firebaseSimpleLogin, $timeout, $q) {
        var cb = jasmine.createSpy();
        customSpy($firebaseSimpleLogin.fns, '$changePassword', function(email, op, np) {
          var def = $q.defer();
          $timeout(function() { def.reject(new ErrorWithCode(123, 'errr')); });
          return def.promise;
        });
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 124,
          newpass: 123,
          confirm: 123,
          callback: cb
        });
        flush($timeout);
        expect(cb.argsForCall[0][0].toString()).toBe('errr');
        expect($firebaseSimpleLogin.fns.$changePassword).toHaveBeenCalled();
      })
    );

    it('should return null if $firebaseSimpleLogin succeeds',
      inject(function(simpleLogin, $firebaseSimpleLogin, $timeout) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 124,
          newpass: 123,
          confirm: 123,
          callback: cb
        });
        flush($timeout);
        expect(cb).toHaveBeenCalledWith(null);
        expect($firebaseSimpleLogin.fns.$changePassword).toHaveBeenCalled();
      })
    );
  });

  describe('#createAccount', function() {
    beforeEach(inject(function($timeout, $firebaseSimpleLogin, $q) {
      customSpy($firebaseSimpleLogin.fns, '$createUser', function(eml, pass) {
        var def = $q.defer();
        $timeout(function() { def.resolve({name: 'kato'}); });
        return def.promise;
      });
    }));

    it('should invoke $firebaseSimpleLogin',
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        simpleLogin.init('/login');
        simpleLogin.createAccount('test@test.com', 123);
        expect($firebaseSimpleLogin.fns.$createUser).toHaveBeenCalled();
      })
    );

    it('should invoke callback if error',
      inject(function(simpleLogin, $timeout, $firebaseSimpleLogin, $q) {
        var cb = jasmine.createSpy(), undefined;
        customSpy($firebaseSimpleLogin.fns, '$createUser', function(email, pass) {
          var def = $q.defer();
          def.reject('joy!');
          return def.promise;
        });
        simpleLogin.init();
        simpleLogin.createAccount('test@test.com', 123, cb);
        flush($timeout);
        expect(cb).toHaveBeenCalledWith('joy!');
      })
    );

    it('should invoke callback if success',
      inject(function(simpleLogin, $timeout) {
        var cb = jasmine.createSpy();
        simpleLogin.init();
        simpleLogin.createAccount('test@test.com', 123, cb);
        flush($timeout);
        expect(cb).toHaveBeenCalledWith(null, {name: 'kato'});
      })
    )
  });

  describe('#createAccount', function() {
    it('should be the createProfile service',
      inject(function(simpleLogin, createProfile) {
        expect(simpleLogin.createAccount).toBe(createProfile);
      })
    );
  });

  describe('createProfile', function() {
    it('should invoke set on Firebase',
      inject(function(createProfile, fbutil, $timeout) {
        createProfile(123, 'test@test.com');
        flush($timeout);
        expect(fbutil.fns.set.argsForCall[0][0]).toEqual({email: 'test@test.com', name: 'Test'});
      })
    );

    it('should return a promise',
      inject(function(createProfile) {
        expect(createProfile(456, 'test2@test2.com')).toBeAPromise();
      })
    );

    it('should return any error in the reject',
      inject(function(createProfile, fbutil, $timeout) {
        var cb = jasmine.createSpy();
        fbutil.$$ref.fns.set.andReturn('noooooo');
        createProfile(456, 'test2@test2.com').then(null, cb);
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

  function fbutilStub() {
    var obj = jasmine.createSpyObj('fbutil', ['syncObject', 'syncArray', 'ref']);
    obj.$$ref = new Firebase();
    obj.syncObject.andCallFake(function() { return {}; });
    obj.syncArray.andCallFake(function() { return []; });
    obj.ref.andCallFake(function() { return obj.$$ref; });
    return obj;
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