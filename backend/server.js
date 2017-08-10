const net = require('net');
const express = require('express');
const controller = require('./controller');

const BASE_PORT = 3000;

function findAvailablePort(port, callback) {
    let server = net.createServer();
    server.listen(port, (err) => {
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

            this._setupRoutes(app);

            this.server = app.listen(port, (err) => {
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
            this._getIndex(req, res);
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
        this.sysdigController.runCsysdig(args, response);
    }

    _getView(request, response) {
        let fileName = request.params.fileName;
        let viewInfo = JSON.parse(request.params.view);
        let args = ['-r', fileName, '-v', viewInfo.id, '-j'];

        if ('from' in request.query) {
            args.push('--from');
            args.push(request.query.from);
        }

        if ('filter' in viewInfo) {
            args.push(viewInfo.filter);
        }

        if ('to' in request.query) {
            args.push('--to');
            args.push(request.query.to);
        }

        response.setHeader('Content-Type', 'application/json');
        this.sysdigController.runCsysdig(args, response);
    }

    _getIndex(request, response) {
        let fileName = request.params.fileName;
        let args = ['-r', fileName, '-c', 'wsysdig_summary'];

        response.setHeader('Content-Type', 'application/json');
        this.sysdigController.runSysdig(args, response);
    }
}

function createServer(sysdigPath, port) {
    return new Server(sysdigPath, port);
}

module.exports = createServer;
