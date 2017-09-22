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

/* eslint-env node */
const electron = require('electron');
const argv = require('yargs').argv;
const { app, BrowserWindow, protocol, globalShortcut } = electron;
const { dirname, join, resolve } = require('path');
const protocolServe = require('electron-protocol-serve');
const backendServer = require('./backend/server');

const emberAppLocation = 'serve://dist';

let serverInstance = null;
let serverPort = null;
let mainWindow = null;

// Registering a protocol & schema to serve our Ember application
protocol.registerStandardSchemes(['serve'], { secure: true });
protocolServe({
    cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
    app,
    protocol,
});

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/
// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });

function createServer() {
    const absPath = argv.p ? resolve(__dirname, '../../../', argv.p) + '/' : null;

    serverInstance = backendServer(absPath)
    serverInstance.start((port) => {
        serverPort = port;

        createWindow(port);
        setupListeners();
    });
}

function createParamsUrl(port) {
    // Add a query param to the ember app URL
    // in order to provide the server port number for requests
    return port ? emberAppLocation + '?port=' + port : emberAppLocation;
}

function createWindow(port) {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        width: Math.max(width * 0.9, 1440),
        height: 900,
    });
    // Hide
    mainWindow.setMenu(null);

    // Register a shortcuts for open devTools
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.toggleDevTools();
    });

    // Register a shortcuts for reload page
    globalShortcut.register('CommandOrControl+R', () => {
        mainWindow.reload();
    });

    // Load the ember application using our custom protocol/scheme
    mainWindow.loadURL(createParamsUrl(port));
}

function setupListeners() {
    // If a loading operation goes wrong, we'll send Electron back to
    // Ember App entry point
    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadURL(emberAppLocation);
    });

    mainWindow.webContents.on('crashed', () => {
        console.log('Your Ember app (or other code) in the main window has crashed.');
        console.log('This is a serious issue that needs to be handled and/or debugged.');
    });

    mainWindow.on('unresponsive', () => {
        console.log('Your Ember app (or other code) has made the window unresponsive.');
    });

    mainWindow.on('responsive', () => {
        console.log('The main window has become responsive again.');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // Using exit instead of quit for the time being
        // see: https://github.com/electron/electron/issues/8862#issuecomment-294303518
        app.exit();
    }
});

app.on('before-quit', () => {
    if (window && !window.isDestroyed() && window.isVisible()) {
        window.removeAllListeners();
        window.close();

        setTimeout(() => app.exit(), 2000);
    }
});

app.on('ready', () => {
    createServer();
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (serverInstance === null) {
        createServer();
    } else if (mainWindow === null) {
        createWindow(serverPort);
    }
});

// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
    console.log('An exception in the main thread was not handled.');
    console.log('This is a serious issue that needs to be handled and/or debugged.');
    console.log(`Exception: ${err}`);
});
