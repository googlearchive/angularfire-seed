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
        var cb = jasmine.createSpy('reject');
        authStub.$$last.$login.andReturn($q.reject('test_error', null));
        simpleLogin.login('test@test.com', '123').catch(cb);
        flush();
        expect(cb).toHaveBeenCalledWith('test_error');
      })
    );

    it('should return user if $firebaseSimpleLogin.$login succeeds',
      inject(function(simpleLogin) {
        var cb = jasmine.createSpy('resolve');
        simpleLogin.login('test@test.com', '123').then(cb);
        flush();
        expect(cb).toHaveBeenCalledWith(jasmine.objectContaining(authStub.$$user));
      })
    );
  });

  describe('#logout', function() {
    it('should invoke $firebaseSimpleLogin.$logout()', function() {
      inject(function(simpleLogin, $firebaseSimpleLogin) {
        simpleLogin.logout();
        expect($firebaseSimpleLogin.$$last.$logout).toHaveBeenCalled();
      });
    });
  });

  describe('#changePassword', function() {
    var simpleLogin, $fsl;
    beforeEach(inject(function($firebaseSimpleLogin, _simpleLogin_) {
      simpleLogin = _simpleLogin_;
      $fsl = $firebaseSimpleLogin.$$last;
    }));

    it('should fail if $firebaseSimpleLogin fails', function() {
      var cb = jasmine.createSpy('reject');
      $fsl.$changePassword.andReturn($q.reject('errr'));
      simpleLogin.changePassword({
        oldpass: 124,
        newpass: 123,
        confirm: 123
      }).catch(cb);
      flush();
      expect(cb).toHaveBeenCalledWith('errr');
      expect($fsl.$changePassword).toHaveBeenCalled();
    });

    it('should resolve to user if $firebaseSimpleLogin succeeds', function() {
      var cb = jasmine.createSpy('resolve');
      simpleLogin.changePassword({
        oldpass: 124,
        newpass: 123,
        confirm: 123
      }).then(cb);
      flush();
      expect(cb).toHaveBeenCalledWith(authStub.$$user);
      expect($fsl.$changePassword).toHaveBeenCalled();
    });
  });

  describe('#createAccount', function() {
    var $fsl, simpleLogin;
    beforeEach(inject(function($firebaseSimpleLogin, _simpleLogin_) {
      simpleLogin = _simpleLogin_;
      $fsl = authStub.$$last;
    }));

    it('should invoke $firebaseSimpleLogin', function() {
      simpleLogin.createAccount('test@test.com', 123);
      expect($fsl.$createUser).toHaveBeenCalled();
    });

    it('should reject promise if error', function() {
      var cb = jasmine.createSpy('reject');
      $fsl.$createUser.andReturn($q.reject('test_error'));
      simpleLogin.createAccount('test@test.com', 123).catch(cb);
      flush();
      expect(cb).toHaveBeenCalledWith('test_error');
    });

    it('should fulfill if success', function() {
      var cb = jasmine.createSpy('resolve');
      simpleLogin.createAccount('test@test.com', 123).then(cb);
      flush();
      expect(cb).toHaveBeenCalledWith({uid: 'test123'});
    });
  });

  describe('#createProfile', function() {
    it('should invoke set on Firebase',
      inject(function(createProfile, fbutil) {
        createProfile(123, 'test@test.com');
        flush();
        expect(fbutil.$$ref.set).toHaveBeenCalledWith({email: 'test@test.com', name: 'Test'}, jasmine.any(Function));
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
        fbutil.$$ref.set.andCallFake(function(val, cb) {
          cb && cb('noooooo');
        });
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
    fbutilStub.$$last = obj;
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
      obj[m].andReturn(resolve(authStub.$$user));
    });
    authStub.$$last = obj;
    return obj;
  }
  authStub.$$user = {uid: 'test123'};

  function flush() {
    try {
      while(true) {
        // flush until there is nothing left to flush (i.e. $timeout throws an error)
        // this is necessary for createAccount which uses some chained promises that
        // iterate through set/remove/promise calls, all of which have to get flushed
        fbutilStub.$$last.$$ref.flush();
        $timeout.flush();
      }
    }
    catch(e) {} // is okay
  }

  function ErrorWithCode(code, msg) {
    this.code = code;
    this.msg = msg;
  }
  ErrorWithCode.prototype.toString = function() { return this.msg; }
});