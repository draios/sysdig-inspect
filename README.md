# wsysdig

Sysdig capture analyzer. Is an interface for analyze captures using a multiplatform desktop client. It uses [EmberJS](https://emberjs.com/) + [Electron](https://electron.atom.io/).

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/): `npm install -g ember-cli`
* Sysdig!
    1. clone https://github.com/draios/sysdig (`csysdig_json` branch)
    2. build the tool following instructions at https://github.com/draios/sysdig/wiki/How-to-Install-Sysdig-from-the-Source-Code#linux-and-osx

## Prepare the environment

* `git clone https://github.com/draios/wsysdig.git`
* `cd wsysdig`
* `npm install`

If you need to remove all artifacts of the installation and successive builds, you can run `npm run clean`.

## Run the Electron application

- `npm start`

## Run the dev environment

Open 2 separate terminals, one for the backend and one for the frontend:

1. Backend
    * `npm run backend --- [path to sysdig binaries]`

2. Web application
    * `npm run dev`
    * Visit your app at http://localhost:4200

## Run the tests

* `npm test`

### Build it!

* `ember build` (development version)
* `ember build --environment production` (production version)
* `ember electron:package` - Create binaries (.app, .exe, etc.)
* `ember electron:make` - Generate platform specific distributables (installers, distribution packages, etc.)
* `ember electron:build` - Build out Ember app with Electron instrumentation (useful for optimizing multi-platform builds)
