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

const { spawn } = require('child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');


class Controller {
    constructor(sysdigPath) {
        this.sysdigPath = sysdigPath;

        if (process.platform === 'win32') {
            this.sysdigExe = path.join(this.sysdigPath, '/sysdig.exe');
            this.csysdigExe = path.join(this.sysdigPath, '/csysdig.exe');
        } else {
            this.sysdigExe = path.join(this.sysdigPath, '/sysdig');
            this.csysdigExe = path.join(this.sysdigPath, '/csysdig');
        }

        if (fs.existsSync(this.sysdigExe) === false) {
            console.error(`sysdig executable not found at ${this.sysdigExe}`);
            process.exit();
        }
        if (fs.existsSync(this.csysdigExe) === false) {
            console.error(`csysdig executable not found at ${this.csysdigExe}`);
            process.exit();
        }
    }

    runCsysdig(args, response) {
        return this._run(this.csysdigExe, args, response);
    }

    runSysdig(args, response) {
        return this._run(this.sysdigExe, args, response);
    }

    //
    // This is the API entry point. It works by running csysdig and piping its
    // output to the connection.
    //
    _run(exe, args, response) {
        let options = { cwd: this.sysdigPath };

        console.log(`spawning ${this.sysdigPath}/${exe} with args`, args);
        const prc = spawn(exe, args, options);

        prc.stdout.setEncoding('utf8');
        prc.stderr.setEncoding('utf8');
        prc.stdin.setEncoding('utf8');

        prc.stdout.on('data', (data) => {
            response.write(data);
        });

        prc.stderr.on('data', (data) => {
            console.error(`${exe} error`, data);
            response.status(500);
            response.send(JSON.stringify({ reason: data }));
        });

        prc.on('close', (code) => {
            response.end();
            console.error(`${exe} exited with code ${code}`);
        });

        prc.on('error', (err) => {
            console.error(`${exe} error: cannot start (make sure sysdig is installed correctly)`);
            console.error(err);
        });
    }
}

function createController(sysdigPath) {
    return new Controller(sysdigPath);
}

module.exports = createController;
