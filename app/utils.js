/* global Mousetrap */

export function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
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

export function setupHookForLinks() {
    if (isElectron()) {
        const { shell } = requireNode('electron');
        document.addEventListener('click', function(event) {
            const href = event.target.getAttribute('href');
            if (href && href.indexOf('http') === 0) {
                shell.openExternal(href);
                event.preventDefault();
            }
        });
    }
}

export function addShortcut(keys, callback) {
    Mousetrap.bind(keys, callback);
}
