const { assert } = require('chai');
const argv = require('yargs').argv;
const path = require('path');
const http = require('http');
const backendServer = require('../server');

// expected sysdig+csysdig compiled executables in backend/sysdig/
const SYSDIG_DEFAULT_PATH = path.join(__dirname, '..', '/sysdig/');
// path starting from SYSDIG_DEFAULT_PATH
const SYSDIG_DEFAULT_CAPTURE = 'capture_test.scap';

let BASE_URL = 'http://localhost:';
let absPath = argv.p ? path.join(__dirname, argv.p) : SYSDIG_DEFAULT_PATH;
let capturePath = '/' + (argv.r ? argv.r : SYSDIG_DEFAULT_CAPTURE);

backendServer(absPath).start((port, err) => {
    // set the base request url
    BASE_URL += (port + '/capture');
});

describe('/views test', () => {
    it('get views 200', (done) => {
        http.get(BASE_URL + '/views', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
});

describe('/summary test', () => {
    it('get summary 200', (done) => {
        http.get(BASE_URL + capturePath + '/summary', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
});

describe('single view test', () => {
    it('get view 200', (done) => {
        http.get(BASE_URL + capturePath + '/{"id":"traces_summary"}', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
    it('get filter view 200', (done) => {
        http.get(BASE_URL + capturePath + '/{"id":"traces_summary", "filter":"proc.name=cat"}', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
});

describe('single view * test', () => {
    it('get view 200', (done) => {
        http.get(BASE_URL + capturePath + '/*/{"id":"traces_summary"}', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
});

describe('query params', () => {
    it('get from params view 200', (done) => {
        http.get(BASE_URL + capturePath + '/*/{"id":"traces_summary"}?from=0', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
    it('get to params view 200', (done) => {
        http.get(BASE_URL + capturePath + '/*/{"id":"traces_summary"}?from=0&to=100', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 200);
            done();
        });
    });
});

describe('wrong url test', () => {
    it('not found 404', (done) => {
        http.get(BASE_URL + '/foo', (res) => {
            const { statusCode } = res;
            assert.equal(statusCode, 404);
            done();
        });
    });
});

