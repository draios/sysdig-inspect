module.exports = {
  "make_targets": {
    "win32": [
      "squirrel"
    ],
    "darwin": [
      "dmg",
      "zip"
    ],
    "linux": [
      "deb",
      "rpm"
    ]
  },
  "electronPackagerConfig": {
    "appCopyright": "Copyright (C) 2017 Draios inc.",
    "name": "Sysdig Inspect",
    "versionString": {
        "CompanyName": "Sysdig",
        "FileDescription": "Sysdig Inspect for Desktop",
        "ProductName": "Sysdig Inspect",
        "InternalName": "Sysdig Inspect"
    },
    "icon": "assets/icons/favicon",
    "osxSign": true,
    "overwrite": true
  },
  "electronInstallerDMG": {
    "title": "Sysdig Inspect",
    "background": "assets/dmg/installer-background.png",
    "icon-size": 80
  },
  "electronInstallerDebian": {
    src: '...',
    dest: '...',
    name: 'sysdig-inspect',
    bin: 'Sysdig Inspect'
  },
  "electronInstallerRedhat": {
    src: '...',
    dest: '...',
    name: 'sysdig-inspect',
    bin: 'Sysdig Inspect'
  },
  "github_repository": {
    "owner": "draios",
    "name": "sysdig-inspect"
  }
};
