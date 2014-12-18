"use strict";
describe('auth', function() {
  var $q, $timeout, auth, fbutil, simpleLogin;
  beforeEach(function() {
    module('mock.firebase');
    module('simpleLogin');
    module('mock.fbutil');
    module('mock.firebaseAuth');
    module(function($provide) {
      // mock up $location since we don't want to change paths here
      $provide.value('$location', {path: jasmine.createSpy()});
    });
    inject(function(_$q_, _$timeout_, $firebaseAuth, _fbutil_, _simpleLogin_) {
      $q = _$q_;
      $timeout = _$timeout_;
      fbutil = _fbutil_;
      auth = $firebaseAuth(fbutil.ref());
      simpleLogin = _simpleLogin_;
    });
  });

  describe('#login', function() {
    it('should return error if $authWithPassword fails',
      inject(function($q, simpleLogin) {
        var cb = jasmine.createSpy('reject');
        spyOn(auth, '$authWithPassword').andReturn(reject('test_error', null));
        simpleLogin.login('test@test.com', '123').catch(cb);
        flush();
        expect(cb).toHaveBeenCalledWith('test_error');
      })
    );

    it('should return user if $authWithPassword succeeds',
      inject(function(simpleLogin) {
        spyOn(auth, '$authWithPassword').andReturn(resolve({uid: 'kato'}));
        var cb = jasmine.createSpy('resolve');
        simpleLogin.login('test@test.com', '123').then(cb);
        flush();
        expect(cb).toHaveBeenCalledWith({uid: 'kato'});
      })
    );
  });

  describe('#logout', function() {
    it('should invoke $firebaseAuth.$unauth()', function() {
      inject(function(simpleLogin) {
        spyOn(auth, '$unauth');
        simpleLogin.logout();
        expect(auth.$unauth).toHaveBeenCalled();
      });
    });
  });

  describe('#changePassword', function() {
    it('should fail if $firebaseSimpleLogin fails', function() {
      spyOn(auth, '$changePassword').andReturn(reject('errr'));
      var cb = jasmine.createSpy('reject');
      simpleLogin.changePassword({
        oldpass: 124,
        newpass: 123,
        confirm: 123
      }).catch(cb);
      flush();
      expect(cb).toHaveBeenCalledWith('errr');
      expect(auth.$changePassword).toHaveBeenCalled();
    });

    it('should resolve to user if $firebaseSimpleLogin succeeds', function() {
      spyOn(auth, '$changePassword').andReturn(resolve({uid: 'kato'}));
      var cb = jasmine.createSpy('resolve');
      simpleLogin.changePassword({
        oldpass: 124,
        newpass: 123,
        confirm: 123
      }).then(cb);
      flush();
      expect(cb).toHaveBeenCalledWith({uid: 'kato'});
      expect(auth.$changePassword).toHaveBeenCalled();
    });
  });

  describe('#createAccount', function() {
    var simpleLogin;
    beforeEach(inject(function(_simpleLogin_) {
      simpleLogin = _simpleLogin_;
    }));

    it('should invoke $createUser', function() {
      spyOn(auth, '$createUser').andReturn(resolve());
      simpleLogin.createAccount('test@test.com', '123');
      expect(auth.$createUser).toHaveBeenCalled();
    });

    it('should reject promise if error', function() {
      var cb = jasmine.createSpy('reject');
      spyOn(auth, '$createUser').andReturn(reject('test_error'));
      simpleLogin.createAccount('test@test.com', '123').catch(cb);
      flush();
      expect(cb).toHaveBeenCalledWith('test_error');
    });

    it('should fulfill if success', function() {
      var cb = jasmine.createSpy('resolve');
      simpleLogin.createAccount('test@test.com', '123').then(cb);
      flush();
      auth.$$ref.changeAuthState({uid: 'test123'});
      flush();
      expect(cb).toHaveBeenCalledWith({uid: 'test123'});
    });
  });

  describe('#createProfile', function() {
    it('should invoke set on Firebase',
      inject(function(createProfile, fbutil) {
        spyOn(fbutil.ref(), 'set');
        createProfile(123, 'test@test.com');
        flush();
        expect(fbutil.ref().set).toHaveBeenCalledWith({email: 'test@test.com', name: 'Test'}, jasmine.any(Function));
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
        spyOn(fbutil.ref(), 'set').andCallFake(function() {
          cb && cb('nooo');
        });
        createProfile(456, 'test2@test2.com').then(null, cb);
        flush();
        expect(cb).toHaveBeenCalledWith('nooo');
      })
    );
  });

  describe('#changeEmail', function() {
    it('should have tests'); //todo-test
  });

  function resolve() {
    var def = $q.defer();
    def.resolve.apply(def, Array.prototype.slice.call(arguments, 0));
    return def.promise;
  }

  function reject(err) {
    return $q.reject(err);
  }

  function flush() {
    try {
      while(true) {
        // flush until there is nothing left to flush (i.e. $timeout throws an error)
        // this is necessary as some of the auth methods end up chaining multiple events,
        // each of which utilizes $timeout--hopefully we can fix this by switching to $evalAsync
        // in the future
        try { fbutil.ref().flush(); } catch(e) {}
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