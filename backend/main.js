const path = require('path');
const argv = require('yargs').argv;
const backendServer = require('./server');

let absPath = argv.p ? path.resolve(__dirname, argv.p) + '/' : undefined;

backendServer(absPath).start();
console.log('press CTRL+C for exit');
