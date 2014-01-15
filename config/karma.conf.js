module.exports = function(config){
   config.set({
      basePath : '../',

      files : [
         'test/lib/angular/angular.js',
         'test/lib/angular/angular-route.js',
         'test/lib/firebase/firebase-debug.js',
         'test/lib/firebase/firebase-simple-login.js',
         'test/lib/firebase/angularfire.js',
         'test/lib/angular/angular-mocks.js',
         'app/js/**/*.js',
//         'test/unit/**/*.js'
         'test/unit/servicesSpec.js'
      ],

      autoWatch : true,

      frameworks: ['jasmine'],

      browsers : ['Chrome'],

      plugins : [
         'karma-junit-reporter',
         'karma-chrome-launcher',
         'karma-firefox-launcher',
         'karma-jasmine'
      ],

      junitReporter : {
         outputFile: 'test_out/unit.xml',
         suite: 'unit'
      }

   })}