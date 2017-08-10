const { spawn } = require('child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');


class Controller {
    constructor(sysdigPath) {
        if (typeof sysdigPath === 'undefined') {
            sysdigPath = path.join(__dirname, '/sysdig/');
        }

        this.sysdigPath = sysdigPath;
        this.sysdigExe = sysdigPath + 'sysdig';
        this.csysdigExe = sysdigPath + 'csysdig';

        if (!fs.existsSync(this.sysdigExe)) {
            console.log(`sysdig not found in path ${sysdigPath}`);
            process.exit();
        }
    }

    sendError(message, response) {
        let resBody = { reason: message };

        response.status(500);
        response.send(JSON.stringify(resBody));
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

        console.log(`spawning ${exe} with args: ${args}`);
        this.prc = spawn(exe, args, options);

        this.prc.stdout.setEncoding('utf8');
        this.prc.stderr.setEncoding('utf8');
        this.prc.stdin.setEncoding('utf8');

        this.prc.stdout.on('data', (data) => {
            response.write(data);
        });

        this.prc.stderr.on('data', (data) => {
            this.sendError(data, response);
        });

        this.prc.on('close', (code) => {
            response.end();
            console.log(`sysdig process exited with code ${code}`);
        });

        this.prc.on('error', (err) => {
            console.log('Cannot start csysdig. Make sure sysdig is installed correctly.');
            console.log(err);
        });
    }
}

function createController(sysdigPath) {
    return new Controller(sysdigPath);
}

module.exports = createController;
