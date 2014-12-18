angular.module('changeEmail', ['firebase.utils'])
  .factory('changeEmail', ['fbutil', '$q', '$rootScope', function(fbutil, $q, $rootScope) {
    return function(password, oldEmail, newEmail, simpleLogin) {
      var ctx = { old: { email: oldEmail }, curr: { email: newEmail } };

      // this prevents the routes.js logic from redirecting to the login page
      // while we log out of the old account and into the new one, see routes.js
      $rootScope.authChangeInProgress = true;

      // execute activities in order; first we authenticate the user
      return authOldAccount()
        // then we fetch old account details
        .then( loadOldProfile )
        // then we create a new account
        .then( createNewAccount )
        // then we copy old account info
        .then( copyProfile )
        // and once they safely exist, then we can delete the old ones
        // we have to authenticate as the old user again
        .then( authOldAccount )
        .then( removeOldProfile )
        .then( removeOldLogin )
        // and now authenticate as the new user
        .then( authNewAccount )
        .catch(function(err) { console.error(err); return $q.reject(err); })
        .finally(function() {
          $rootScope.authChangeInProgress = false;
        });

      function authOldAccount() {
        return simpleLogin.login(ctx.old.email, password).then(function(user) {
          ctx.old.uid = user.uid;
        });
      }

      function loadOldProfile() {
        var def = $q.defer();
        ctx.old.ref = fbutil.ref('users', ctx.old.uid);
        ctx.old.ref.once('value',
          function(snap){
            var dat = snap.val();
            if( dat === null ) {
              def.reject(oldEmail + ' not found');
            }
            else {
              ctx.old.name = dat.name;
              def.resolve();
            }
          },
          function(err){
            def.reject(err);
          });
        return def.promise;
      }

      function createNewAccount() {
        return simpleLogin.createAccount(ctx.curr.email, password, ctx.old.name).then(function(user) {
          ctx.curr.uid = user.uid;
        });
      }

      function copyProfile() {
        var d = $q.defer();
        ctx.curr.ref = fbutil.ref('users', ctx.curr.uid);
        var profile = {email: ctx.curr.email, name: ctx.old.name||''};
        ctx.curr.ref.set(profile, function(err) {
          if (err) {
            d.reject(err);
          } else {
            d.resolve();
          }
        });
        return d.promise;
      }

      function removeOldProfile() {
        var d = $q.defer();
        ctx.old.ref.remove(function(err) {
          if (err) {
            d.reject(err);
          } else {
            d.resolve();
          }
        });
        return d.promise;
      }

      function removeOldLogin() {
        var def = $q.defer();
        simpleLogin.removeUser(ctx.old.email, password).then(function() {
          def.resolve();
        }, function(err) {
          def.reject(err);
        });
        return def.promise;
      }

      function authNewAccount() {
        return simpleLogin.login(ctx.curr.email, password);
      }
    };
  }]);