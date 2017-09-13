module.exports = {
    'make_targets': {
        'win32': ['squirrel'],
        'darwin': ['zip', 'dmg'],
        'linux': ['deb', 'rpm']
    },
    'electronPackagerConfig': {
        'name': 'Sysdig Inspector',
        'all': true,
        'overwrite': true
    },
    'electronWinstallerConfig': {
        'name': ''
    },
    'electronInstallerDebian': {},
    'electronInstallerRedhat': {},
    'github_repository': {
        'owner': '',
        'name': ''
    }
};
