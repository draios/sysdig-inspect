# wsysdig

Sysdig capture analyzer. Is an interface for analyze captures using a multiplatform desktop client. It uses [EmberJS](https://emberjs.com/) + [Electron](https://electron.atom.io/).

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)
  `npm install -g ember-cli`

## Installation

* `git clone https://github.com/draios/wsysdig.git`
* `cd wsysdig`
* `npm install`

## Running / Development

#### Ember web application

* `npm run frontend` or `npm run f` or `npm start`
* Visit your app at [http://localhost:4200](http://localhost:4200).

#### Wsysdig backend

* `npm run backend` or `npm run b` using  the default sysdig executables path `~/git/sysdig/build/userspace/sysdig`
* `npm run backend --- /path/to/sysdig` using a custom sysdig path as parameter

#### Electron desktop

- `npm run electron` or `npm run e`

### Running Tests

* `npm test`

### Building

* `ember build` (development)
* `ember build --environment production` (production)
* `ember electron:package` - Create binaries (.app, .exe, etc)
* `ember electron:make` - Generate platform specific distributables (installers, distribution packages, etc)
* `ember electron:build` - Build out Ember app with Electron instrumentation (useful for optimizing multi-platform builds)
