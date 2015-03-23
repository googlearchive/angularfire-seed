angular.module('firebase.auth', ['firebase', 'firebase.utils'])
  .factory('Auth', ['$firebaseAuth', 'fbutil', function($firebaseAuth, fbutil) {
    return $firebaseAuth(fbutil.ref());
  }]);

    //    var fns = {
    //      user: null,
    //
    //      getUser: function() {
    //        return auth.$waitForAuth();
    //      },
    //
    //      /**
    //       * @param {string} email
    //       * @param {string} pass
    //       * @returns {*}
    //       */
    //      login: function(email, pass) {
    //        return auth.$authWithPassword({
    //          email: email,
    //          password: pass
    //        }, {rememberMe: true});
    //      },
    //
    //      logout: function() {
    //        auth.$unauth();
    //      },
    //
    //      createAccount: function(email, pass, name) {
    //        return auth.$createUser({email: email, password: pass})
    //          .then(function() {
    //            // authenticate so we have permission to write to Firebase
    //            return fns.login(email, pass);
    //          })
    //          .then(function(user) {
    //            var ref = fbutil.ref('users', user.uid);
    //            return fbutil.handler(function(cb) {
    //              ref.set({email: email, name: name||firstPartOfEmail(email)}, cb);
    //            });
    //          });
    //      },
    //
    //      changePassword: function(email, oldpass, newpass) {
    //        return auth.$changePassword({email: email, oldPassword: oldpass, newPassword: newpass});
    //      },
    //
    //      changeEmail: function(password, oldEmail, newEmail) {
    //        return auth.$changeEmail({password: password, oldEmail: oldEmail, newEmail: newEmail}, this)
    //          .then(function() {
    //            return fbutil.handler(function(cb) {
    //              var ref = fbutil.ref('users', fns.user.uid, 'email');
    //              ref.set(newEmail, cb);
    //            });
    //          });
    //      },
    //
    //      removeUser: function(email, pass) {
    //        return auth.$removeUser({email: email, password: pass});
    //      },
    //
    //      watch: function(cb, $scope) {
    //        fns.getUser().then(function(user) {
    //          cb(user);
    //        });
    //        listeners.push(cb);
    //        var unbind = function() {
    //          var i = listeners.indexOf(cb);
    //          if( i > -1 ) { listeners.splice(i, 1); }
    //        };
    //        if( $scope ) {
    //          $scope.$on('$destroy', unbind);
    //        }
    //        return unbind;
    //      }
    //    };
    //
    //    auth.$onAuth(statusChange);
    //    statusChange();
    //
    //    return fns;
    //  }]);
    //
    //
    //function firstPartOfEmail(email) {
    //  return ucfirst(email.substr(0, email.indexOf('@'))||'');
    //}
    //
    //function ucfirst (str) {
    //  // inspired by: http://kevin.vanzonneveld.net
    //  str += '';
    //  var f = str.charAt(0).toUpperCase();
    //  return f + str.substr(1);
    //}
