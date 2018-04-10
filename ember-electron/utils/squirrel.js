const { spawn } = require('child_process');
const { app } = require('electron');
const path = require('path');

function handleSquirrelEvents() {
    if (process.argv.length === 1) {
        return false;
    }

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawnUpdate = function(args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = spawn(updateDotExe, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    const createShortcuts = function(locations) {
        return spawnUpdate(['--createShortcut', exeName, '-l', locations.join(',')]);
    };

    const removeShortcuts = function() {
        return spawnUpdate(['--removeShortcut', exeName]);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus

        // Install desktop and start menu shortcuts
        createShortcuts(['Desktop', 'StartMenu']);

        setTimeout(app.quit, 1000);
        return true;

        case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        // Remove desktop and start menu shortcuts
        removeShortcuts();

        setTimeout(app.quit, 1000);
        return true;

        case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
};

module.exports = { handleSquirrelEvents };
