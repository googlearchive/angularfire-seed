# angularfire-seed — the seed for Angular+Firebase apps

[![Build Status](https://travis-ci.org/firebase/angularfire-seed.svg)](https://travis-ci.org/firebase/angularfire-seed)

This derivative of [angular-seed](https://github.com/angular/angular-seed) is an application
skeleton for a typical [AngularFire](http://angularfire.com/) web app. You can use it to quickly
bootstrap your Angular + Firebase projects.

The seed is preconfigured to install the Angular framework, Firebase, AngularFire, and a bundle of
development and testing tools.

The seed app doesn't do much, but does demonstrate the basics of Angular + Firebase development,
including:
 * binding synchronized objects
 * binding synchronized arrays
 * authentication
 * route security
 * basic account management

## How to use angularfire-seed

Other than one additional configuration step (specifying your Firebase database URL), this setup is nearly
identical to angular-seed.

### Prerequisites

You need git to clone the angularfire-seed repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test angularfire-seed. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone angularfire-seed

Clone the angularfire-seed repository using [git][git]:

```
git clone https://github.com/firebase/angularfire-seed.git
cd angularfire-seed
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
angularfire-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Configure the Application

 1. Open `app/config.js` and set the value of FBURL constant to your Firebase database URL
 1. Go to your Firebase dashboard and enable email/password authentication under the Auth tab
 1. Copy/paste the contents of `security-rules.json` into your Security tab, which is also under your Firebase dashboard.

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.

## Directory Layout

    app/                  --> all of the files to be used in production
      app.js              --> application
      config.js           --> where you configure Firebase and auth options
      app.css             --> default stylesheet
      index.html          --> app layout file (the main html template file of the app)
      index-async.html    --> just like index.html, but loads js files asynchronously
      components/         --> javascript files
        appversion/       --> The app-version directive
        auth/             --> A wrapper on the `$firebaseAuth` service
        firebase.utils/   --> Some convenience methods for dealing with Firebase event callbacks and refs
        ngcloak/          --> A decorator on the ngCloak directive so that it works with auth
        reverse/          --> A filter to reverse order of arrays
        security/         --> route-based security tools (adds the $routeProvider.whenAuthenticated() method and redirects)
      account/            --> the account view
      chat/               --> the chat view
      home/               --> the default view
      login/              --> login screen
    e2e-tests/            --> protractor end-to-end tests
    test/lib/             --> utilities and mocks for test units

## Testing

There are two kinds of tests in the angularfire-seed application: Unit tests and End to End tests.

### Running Unit Tests

The angularfire-seed app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `test/karma.conf.js`
* the unit tests are found in `test/unit/`

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The angularfire-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angularfire-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


## Updating Dependencies

Previously we recommended that you merge in changes to angularfire-seed into your own fork of the project.
Now that the angular framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular, Firebase, and AngularFire dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Loading AngularFire Asynchronously

The angularfire-seed project supports loading the framework and application scripts asynchronously.  The
special `index-async.html` is designed to support this style of loading.  For it to work you must
inject a piece of Angular JavaScript into the HTML page.  The project has a predefined script to help
do this.

```
npm run update-index-async
```

This will copy the contents of the `angular-loader.js` library file into the `index-async.html` page.
You can run this every time you update the version of Angular that you are using.


## Serving the Application Files

While Angular is client-side-only technology and it's possible to create Angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The angularfire-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

This really depends on how complex your app is and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else should be omitted.

Angular/Firebase apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere they can be accessed by browsers.

## Continuous Integration

### Travis CI

[Travis CI][travis] is a continuous integration service, which can monitor GitHub for new commits
to your repository and execute scripts such as building the app or running tests. The angularfire-seed
project contains a Travis configuration file, `.travis.yml`, which will cause Travis to run your
tests when you push to GitHub.

You will need to enable the integration between Travis and GitHub. See the Travis website for more
instruction on how to do this.

### CloudBees

CloudBees have provided a CI/deployment setup:

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/angular-js-clickstart/master/clickstart.json">
<img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>

If you run this, you will get a cloned version of this repo to start working on in a private git repo,
along with a CI service (in Jenkins) hosted that will run unit and end to end tests in both Firefox and Chrome.


## Contact

For more information on Firebase and AngularFire,
check out https://firebase.com/docs/web/bindings/angular

For more information on AngularJS please check out http://angularjs.org/

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io/1.3/introduction.html
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server
