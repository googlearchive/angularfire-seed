"use strict";
describe('simpleLogin', function() {
  var $q, $timeout;
  beforeEach(function() {
    MockFirebase.override();
    module('simpleLogin');
    module(function($provide) {
      // mock dependencies used by our services to isolate testing
      $provide.value('$location', stub('path'));
      $provide.value('fbutil', fbutilStub());
      $provide.value('$firebaseSimpleLogin', authStub);
    });
    inject(function(_$q_, _$timeout_) {
      $q = _$q_;
      $timeout = _$timeout_;
    });
  });

  afterEach(function() {
    window.Firebase = MockFirebase._origFirebase;
    window.FirebaseSimpleLogin = MockFirebase._origFirebaseSimpleLogin;
  });

  describe('#login', function() {
    it('should return error if $firebaseSimpleLogin.$login fails',
      inject(function($q, simpleLogin) {
        var cb = jasmine.createSpy();
        authStub.last.$login.andReturn('test_error', null);
        simpleLogin.login('test@test.com', '123', cb);
        flush();
        expect(cb).toHaveBeenCalledWith('test_error');
      })
    );

    it('should return user if $firebaseSimpleLogin.$login succeeds',
      inject(function(simpleLogin) {
        var cb = jasmine.createSpy();
        runs(function() {
          FirebaseSimpleLogin.login.andReturn(null, {uid: 'test123'});
          simpleLogin.login('test@test.com', '123', cb);
          flush();
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
    beforeEach(inject(function($firebaseSimpleLogin, $q) {
      customSpy($firebaseSimpleLogin.fns, '$changePassword',
        function(eml, op, np, cb) {
          var def = $q.defer();
          $timeout(function() { def.resolve(); });
          return def.promise;
        });
    }));

    it('should fail if old password is missing',
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          newpass: 123,
          confirm: 123,
          callback: cb
        });
        flush();
        expect(cb).toHaveBeenCalledWith('Please enter a password');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if new password is missing',
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 123,
          confirm: 123,
          callback: cb
        });
        flush();
        expect(cb).toHaveBeenCalledWith('Please enter a password');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if passwords don\'t match',
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        simpleLogin.init('/login');
        simpleLogin.changePassword({
          oldpass: 123,
          newpass: 123,
          confirm: 124,
          callback: cb
        });
        flush();
        expect(cb).toHaveBeenCalledWith('Passwords do not match');
        expect($firebaseSimpleLogin.fns.$changePassword).not.toHaveBeenCalled();
      })
    );

    it('should fail if $firebaseSimpleLogin fails',
      inject(function(simpleLogin, $timeout, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        customSpy($firebaseSimpleLogin, '$changePassword', function(email, op, np) {
          return $q.reject(new ErrorWithCode(123, 'errr'));
        });
        simpleLogin.changePassword({
          oldpass: 124,
          newpass: 123,
          confirm: 123
        }).then(cb);
        flush();
        expect(cb.argsForCall[0][0].toString()).toBe('errr');
        expect($firebaseSimpleLogin.$changePassword).toHaveBeenCalled();
      })
    );

    it('should return null if $firebaseSimpleLogin succeeds',
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        var cb = jasmine.createSpy();
        simpleLogin.changePassword({
          oldpass: 124,
          newpass: 123,
          confirm: 123,
          callback: cb
        });
        flush();
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
      inject(function(simpleLogin, $firebaseSimpleLogin, $q) {
        var cb = jasmine.createSpy(), undefined;
        customSpy($firebaseSimpleLogin.fns, '$createUser', function(email, pass) {
          var def = $q.defer();
          def.reject('joy!');
          return def.promise;
        });
        simpleLogin.init();
        simpleLogin.createAccount('test@test.com', 123, cb);
        flush();
        expect(cb).toHaveBeenCalledWith('joy!');
      })
    );

    it('should invoke callback if success',
      inject(function(simpleLogin) {
        var cb = jasmine.createSpy();
        simpleLogin.init();
        simpleLogin.createAccount('test@test.com', 123, cb);
        flush();
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
      inject(function(createProfile, fbutil) {
        createProfile(123, 'test@test.com');
        flush();
        expect(fbutil.$$ref.set.argsForCall[0][0]).toEqual({email: 'test@test.com', name: 'Test'});
      })
    );

    it('should return a promise',
      inject(function(createProfile) {
        expect(createProfile(456, 'test2@test2.com')).toBeAPromise();
      })
    );

    it('should return any error in the reject',
      inject(function(createProfile, fbutil) {
        var cb = jasmine.createSpy();
        fbutil.$$ref.set.andReturn('noooooo');
        createProfile(456, 'test2@test2.com').then(null, cb);
        flush();
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

  function fbutilStub() {
    var obj = jasmine.createSpyObj('fbutil', ['syncObject', 'syncArray', 'ref']);
    obj.$$ref = new Firebase();
    obj.syncObject.andCallFake(function() { return {}; });
    obj.syncArray.andCallFake(function() { return []; });
    obj.ref.andCallFake(function() { return obj.$$ref; });
    return obj;
  }

  function resolve() {
    var def = $q.defer();
    def.resolve.apply(def, Array.prototype.slice.call(arguments, 0));
    return def.promise;
  }

  function authStub() {
    var list = [
      '$login', '$logout', '$createUser', '$changePassword', '$removeUser', '$getCurrentUser', '$sendPasswordResetEmail'
    ];
    var obj = jasmine.createSpyObj('$firebaseSimpleLogin', list);
    angular.forEach(list, function(m) {
      obj[m].andReturn(resolve({uid: 'test123'}));
    });
    authStub.last = obj;
    return obj;
  }

  function customSpy(obj, m, fn) {
    obj[m] = fn;
    spyOn(obj, m).andCallThrough();
  }

  function flush() {
    try { $timeout.flush(); }
    catch(e) {} // is okay
  }

  function ErrorWithCode(code, msg) {
    this.code = code;
    this.msg = msg;
  }
  ErrorWithCode.prototype.toString = function() { return this.msg; }
});