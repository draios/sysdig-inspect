/* global Mousetrap */

export function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

export function openFileDialog() {
    const {dialog} = requireNode('electron').remote;
    return dialog.showOpenDialog({
        title: 'Open a sysdig capture',
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Sysdig capture', extensions: ['scap']},
            {name: 'All Files', extensions: ['*']}
        ],
    });
}

export function addShortcut() {
    console.log(Mousetrap);
}
