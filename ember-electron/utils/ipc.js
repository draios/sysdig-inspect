const { app, ipcMain } = require('electron');

ipcMain.on('add-recent', (event, path) => {
    // see: https://electron.atom.io/docs/api/app/#appaddrecentdocumentpath-macos-windows
    app.addRecentDocument(path);
});
