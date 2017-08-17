/* eslint-env node */
const electron = require('electron');
const argv = require('yargs').argv;
const { app, BrowserWindow, protocol, globalShortcut } = electron;
const { dirname, join, resolve } = require('path');
const protocolServe = require('electron-protocol-serve');
const backendServer = require('../../../backend/server');

const emberAppLocation = 'serve://dist';

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
    let absPath = ''
    if (argv.p) {
        absPath =  resolve(__dirname, '../../../', argv.p) + '/';
    } else {
        absPath = join(__dirname, '../../../backend/sysdig/');
    }

    backendServer(absPath).start();
}

function createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        width: width * 0.7,
        height: height * 0.7,
    });
    mainWindow.setMenu(null);

    // Register a shortcuts for open devTools
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.toggleDevTools();
    });

    // Load the ember application using our custom protocol/scheme
    mainWindow.loadURL(emberAppLocation);
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
        app.quit();
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
    createWindow();
    setupListeners();
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
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
