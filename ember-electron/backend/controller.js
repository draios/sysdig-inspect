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

        //
        // Use state to understand how to handle responses:
        // - If data has been received, you can only change the status and you'll need to close the stream
        // - If no data has been received, in case of failure you can send the error message
        // - Don't handle errors more than once
        //
        let execState = 'STARTED';

        return new Promise((resolve, reject) => {
            prc.stdout.on('data', (data) => {
                if (execState !== 'FAILED') {
                    if (response) {
                        response.write(data);
                    }

                    execState = 'DATA_RECEIVED';
                }
            });

            prc.stderr.on('data', (data) => {
                console.error(`${this.sysdigPath}/${exe}`, args, 'error read from STDERR', data);

                if (execState !== 'FAILED') {
                    const message = { reason: data };

                    if (response) {
                        response.status(500);

                        if (execState === 'STARTED') {
                            response.send(JSON.stringify(message));
                        }
                    }

                    execState = 'FAILED';

                    reject(message);
                }
            });

            prc.on('error', (err) => {
                //
                // NOTE: Exit event may or may not fire after
                //
                console.error(`${this.sysdigPath}/${exe}`, args, 'error: cannot start (make sure sysdig is installed correctly)', err);

                if (execState !== 'FAILED') {
                    const message = { reason: 'Cannot start csysdig. Make sure sysdig is installed correctly.', details: err };

                    if (response) {
                        response.status(500);

                        if (execState === 'STARTED') {
                            response.send(JSON.stringify({ reason: message.reason }));
                        }
                    }

                    execState = 'FAILED';

                    reject(message);
                }
            });

            prc.on('close', (code, signal) => {
                console.error(`${this.sysdigPath}/${exe}`, args, `exited with code ${code} ${signal}`);

                if (response) {
                    if (execState === 'DATA_RECEIVED') {
                        // Close stream only if anything has been sent
                        response.end();
                    } else if (execState === 'STARTED') {
                        // Send 'no content' if nothing happened
                        response.status(204).send();
                    }
                }

                if (execState !== 'FAILED') {
                    if (code === 0) {
                        resolve({code});
                    } else {
                        const message = { reason: 'Unexpected exit', details: code };
                        reject(message);
                    }
                }

                execState = 'COMPLETED';
            });
        });
    }
}

function createController(sysdigPath) {
    return new Controller(sysdigPath);
}

module.exports = createController;
