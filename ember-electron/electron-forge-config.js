module.exports = {
  'make_targets': {
    'win32': ['squirrel'],
    'darwin': ['zip', 'dmg'],
    'linux': ['deb', 'rpm']
  },
  'electronPackagerConfig': {},
  'electronWinstallerConfig': {
    'name': ''
  },
  'electronInstallerDebian': {},
  'electronInstallerRedhat': {},
  'github_repository': {
    'owner': '',
    'name': ''
  },
  'windowsStoreConfig': {
    'packageName': ''
  }
};
