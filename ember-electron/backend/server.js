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

const net = require('net');
const express = require('express');
const cors = require('cors');
const controller = require('./controller');

const BASE_PORT = 3000;

function findAvailablePort(port, callback) {
    let server = net.createServer();
    server.listen(port, 'localhost', (err) => {
        server.once('close', () => {
            callback(port);
        });
        server.close();
    }).on('error', (err) => {
        // try another port sequentially
        findAvailablePort(port+1, callback);
    });
}

class Server {
    constructor(sysdigPath, port) {
        this.port = port || BASE_PORT;
        this.sysdigController = controller(sysdigPath);
    }

    start(callback) {
        findAvailablePort(this.port, (port) => {
            this.port = port;

            const app = express();
            app.use(cors());

            this._setupRoutes(app);

            this.server = app.listen(port, 'localhost', (err) => {
                if (err) {
                    console.log('error starting server: ', err);
                    if (typeof callback === 'function') {
                        callback(port, 'error starting server: ' + err);
                    }
                }

                console.log('server is listening on port ' + port);
                if (typeof callback === 'function') {
                    callback(port);
                }
            });
        });
    }

    stop() {
        this.server.close();
    }

    _setupRoutes(app) {
        app.get('/capture/views', (req, res) => {
            this._listViews(req, res);
        });

        app.get('/capture/:fileName/summary', (req, res) => {
            this._getSummary(req, res);
        });

        app.get('/capture/:fileName/:view', (req, res) => {
            this._getView(req, res);
        });

        app.get('/capture/:fileName/*/:view', (req, res) => {
            this._getView(req, res);
        });

        app.use((req, res) => {
            res.status(404).send({
                url: req.originalUrl + ' not found'
            });
        });
    }

    _listViews(request, response) {
        let args = ['--list-views', '-j'];

        response.setHeader('Content-Type', 'application/json');
        this.sysdigController.runCsysdig(args, response);
    }

    _getView(request, response) {
        let fileName = request.params.fileName;
        let viewInfo = JSON.parse(request.params.view);
        let args = ['-r', fileName, '-v', viewInfo.id, '-j', '-pc'];

        switch (viewInfo.viewAs) {
            case 'dottedAscii':
                // no argument needed
                break;
            case 'hex':
                args.push('-X');
                break;
            default:
                // default to printable ASCII
                args.push('-A');
                break;
        }

        if ('filter' in viewInfo) {
            args.push(viewInfo.filter);
        }

        response.setHeader('Content-Type', 'application/json');
        this.sysdigController.runCsysdig(args, response);
    }

    _getSummary(request, response) {
        const fileName = request.params.fileName;
        const filter = request.query.filter;
        let sampleCount = 0;

        response.setHeader('Content-Type', 'application/json');

        const args = ['-r', fileName, '-c', 'wsysdig_summary'];

        if (request.query.sampleCount !== undefined) {
            sampleCount = request.query.sampleCount;
        }
        args.push(sampleCount);

        if (filter !== undefined) {
            args.push(filter);
        }

        this.sysdigController.runSysdig(args, response);
    }
}

function createServer(sysdigPath, port) {
    return new Server(sysdigPath, port);
}

module.exports = createServer;
