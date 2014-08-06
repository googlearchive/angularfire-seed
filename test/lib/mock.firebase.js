
angular.module('mock.firebase', [])
  .value('Firebase', MockFirebase)
  .config(function($windowProvider) {
    $windowProvider.Firebase = $windowProvider.MockFirebase;
  })
  .run(function() {
    MockFirebase.override();
  });