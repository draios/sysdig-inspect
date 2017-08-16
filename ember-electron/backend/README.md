# wsysdig backend

Backend server for run sysdig on a capture end receive json output data.

## Prerequisites

* [Node.js](https://nodejs.org/) (with NPM)
* sysdig + csysdig executables in the same folder (e.g. `./sysdig`)

## Installation

* `npm install`

## Running / Development

* `npm start` if you have a `./sysdig` folder wih executables inside,
* `npm start -- --p=../sysdig_path` for use a different RELATIVE path for sysdig folder.

### Running Tests

* `npm test` if you have a `./sysdig` folder wih executables inside and a capture named `capture_test.scap`
* `npm test -- --p=../sysdig_path --r=/custom_capture.scap` for use a different RELATIVE path for sysdig folder and a capture with custom name inside.
