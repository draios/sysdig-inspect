/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const path = require('path');
const argv = require('yargs').argv;
const backendServer = require('./server');

let absPath;
if (argv.p) {
    absPath = path.resolve(__dirname, argv.p);
} else if (process.env.SYSDIG_PATH) {
    absPath = path.resolve(__dirname, process.env.SYSDIG_PATH);
} else {
    absPath = path.join(__dirname, '../resources/sysdig/');
}

backendServer(absPath, process.env.SYSDIG_SERVER_PORT, process.env.SYSDIG_SERVER_HOSTNAME).start();
console.log('press CTRL+C for exit');
