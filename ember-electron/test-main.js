/* eslint-env node */
const { app, BrowserWindow, protocol } = require('electron');
const { dirname, resolve } = require('path');
const url = require('url');
const protocolServe = require('electron-protocol-serve');

let mainWindow = null;

// The testUrl is a file: url pointing to our index.html, with some query
// params we need to preserve for testem. So we need to register our ember
// protocol accordingly.
let [, , indexUrl] = process.argv;
// Undo workaround for windows (see test-runner.js for explanation)
indexUrl = indexUrl.replace(/__amp__/g, '&');
let {
  pathname: indexPath,
  search: indexQuery,
} = url.parse(indexUrl);
// When we extract the pathname from an absolute path on windows, it starts
// with '/C:/', and the leading slash confuses everything, so we need to strip
// it.
if (process.platform === 'win32') {
  indexPath = indexPath.slice(1);
}
indexPath = resolve(indexPath);
const emberAppLocation = `serve://dist${indexQuery}`;

protocol.registerStandardSchemes(['serve'], { secure: true });
// The index.html is in the tests/ directory, so we want all other assets to
// load from its parent directory
protocolServe({
  cwd: resolve(dirname(indexPath), '..'),
  app,
  protocol,
  indexPath,
});

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function onReady() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundThrottling: false,
  });

  delete mainWindow.module;

  mainWindow.loadURL(emberAppLocation);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
});
