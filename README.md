
# angular-seed — the seed for AngularFire apps

This project is an application skeleton for a typical [AngularFire](http://angularfire.com/) web app.
This library allows you to quickly bootstrap real-time apps using [Firebase](http://www.firebase.com) and [AngularJS](http://www.angularjs.org).

The seed contains AngularJS libraries, test libraries and a bunch of scripts all preconfigured for
instant web development gratification. Just clone the repo (or download the zip/tarball), start up
our (or yours) webserver and you are ready to develop and test your application.

The seed app doesn't do much, just shows how to wire controllers and views together and persist them
in Firebase. You can check it out by opening app/index.html in your browser (might not work
file `file://` scheme in certain browsers, see note below).

_Note: While angular, angularFire, and Firebase can be used client-side-only, and it's possible to create
apps that don't require a backend server at all, we recommend hosting the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`._


## How to use angularFire-seed

 1. Clone the angularFire-seed repository
 1. Open app/js/config.js and add your Firebase URL
 1. Go to your Firebase URL and enable email/password authentication under the Auth tab
 1. Start hacking...

### Serving pages during development

You can pick one of these options:

* serve this repository with your webserver
* install node.js and run `node scripts/web-server.js`

Then navigate your browser to `http://localhost:<port>/app/index.html` to see the app running in
your browser.


### Running the app in production

Make sure you set up security rules for your Firebase! An example for this
seed can be found in `config/security-rules.json`

Go to your Forge (open your Firebase URL in the browser) and add your sites domain name under
Auth -> Authorized Request Origins. This allows simple login to work from your web site as well as localhost.

The rest really depends on how complex is your app and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else can be omitted.

Angular apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere, where they can be accessed by browsers.

If your Angular app is talking to the backend server via xhr or other means, you need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and a webserver(s).


### Running unit tests

We recommend using [jasmine](http://pivotal.github.com/jasmine/) and
[Karma](http://karma-runner.github.io) for your unit tests/specs, but you are free
to use whatever works for you.

Requires [node.js](http://nodejs.org/), Karma (`sudo npm install -g karma`) and a local
or remote browser.

* start `scripts/test.sh` (on windows: `scripts\test.bat`)
  * a browser will start and connect to the Karma server (Chrome is default browser, others can be captured by loading the same url as the one in Chrome or by changing the `config/karma.conf.js` file)
* to run or re-run tests just change any of your source or test javascript files


### End to end testing

Angular ships with a baked-in end-to-end test runner that understands angular, your app and allows
you to write your tests with jasmine-like BDD syntax.

Requires a webserver, node.js + `./scripts/web-server.js` or your backend server that hosts the angular static files.

Check out the
[end-to-end runner's documentation](http://docs.angularjs.org/guide/dev_guide.e2e-testing) for more
info.

* create your end-to-end tests in `test/e2e/scenarios.js`
* serve your project directory with your http/backend server or node.js + `scripts/web-server.js`
* to run do one of:
  * open `http://localhost:port/test/e2e/runner.html` in your browser
  * run the tests from console with [Karma](http://karma-runner.github.io) via
    `scripts/e2e-test.sh` or `script/e2e-test.bat`

### Receiving updates from upstream

When we upgrade angular-seed's repo with newer angular or testing library code, you can just
fetch the changes and merge them into your project with git.

## Directory Layout

    app/                --> all of the files to be used in production
      css/              --> css files
        app.css         --> default stylesheet
      img/              --> image files
      index.html        --> app layout file (the main html template file of the app)
      index-async.html  --> just like index.html, but loads js files asynchronously
      js/               --> javascript files
        app.js          --> application
        config.js       --> custom angularFire config file
        controllers.js  --> application controllers
        directives.js   --> application directives
        filters.js      --> custom angular filters
        services.js     --> custom angular services
      lib/              --> angular and 3rd party javascript libraries
        angular/        --> the latest angular js libs
          version.txt       --> version number
        firebase/
          angularFire.*.js  --> the angularFire adapter
      partials/             --> angular view partials (partial html templates)
        home.html           --> a rudimentary $firebase().$bind() example
        chat.html           --> a $firebase() sync used as an array, with explicit bindings
        login.html          --> authentication and registration using $firebaseAuth
        account.html        --> a secured page (must login to view this)

    config/karma.conf.js        --> config file for running unit tests with Karma
    config/karma-e2e.conf.js    --> config file for running e2e tests with Karma
    config/security-rules.json  --> sample security rules for your Firebase

    scripts/            --> handy shell/js/ruby scripts
      e2e-test.sh       --> runs end-to-end tests with Karma (*nix)
      e2e-test.bat      --> runs end-to-end tests with Karma (windows)
      test.bat          --> autotests unit tests with Karma (windows)
      test.sh           --> autotests unit tests with Karma (*nix)
      web-server.js     --> simple development webserver based on node.js

    test/               --> test source files and libraries
      e2e/              -->
        runner.html     --> end-to-end test runner (open in your browser to run)
        scenarios.js    --> end-to-end specs
      lib/
        angular/                --> angular testing libraries
          angular-mocks.js      --> mocks that replace certain angular services in tests
          angular-scenario.js   --> angular's scenario (end-to-end) test runner library
          version.txt           --> version file
      unit/                     --> unit level specs/tests
        *Spec.js                --> specs for a specific module in app/js

## Contact

More information on AngularFire: http://angularfire.com
More information on Firebase: http://firebase.com
More information on AngularJS: http://angularjs.org/
