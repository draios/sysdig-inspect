# wsysdig

Sysdig capture analyzer. Is an interface for analyze captures using a multiplatform desktop client. It uses [EmberJS](https://emberjs.com/) + [Electron](https://electron.atom.io/).

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)
  `npm install -g ember-cli`
* [PhantomJS](http://phantomjs.org/)
  `npm install -g phantomjs-prebuilt`

## Installation

* `git clone https://github.com/draios/wsysdig.git`
* `cd wsysdig`
* `npm install`

## Running / Development

#### Ember web application

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

#### Electron desktop

- `ember electron`

### Running Tests

* `ember test` (PhantomJS)
* `ember test --serve`
* `ember electron:test`
* `ember electron:test --serve`

### Building

* `ember build` (development)
* `ember build --environment production` (production)
* `ember electron:package` - Create binaries (.app, .exe, etc)
* `ember electron:make` - Generate platform specific distributables (installers, distribution packages, etc)
* `ember electron:build` - Build out Ember app with Electron instrumentation (useful for optimizing multi-platform builds)
