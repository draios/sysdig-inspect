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
    "icon": "assets/icons/favicon.icns",
    "icon-size": 80
  },
  "electronInstallerDebian": {
    "name": "sysdig-inspect",
    "bin": "Sysdig Inspect",
    "productName": "Sysdig Inspect",
    "productDescription": "Sysdig's interactive UI",
    "homepage": "https://www.sysdig.org/",
    "genericName": "Monitoring tool",
    "icon": "assets/icons/favicon.png",
    "categories": [
      "System"
    ]
  },
  "electronInstallerRedhat": {
    "name": "sysdig-inspect",
    "bin": "Sysdig Inspect",
    "productName": "Sysdig Inspect",
    "productDescription": "Sysdig's interactive UI",
    "homepage": "https://www.sysdig.org/",
    "genericName": "Monitoring tool",
    "icon": "assets/icons/favicon.png",
    "categories": [
      "System"
    ]
  },
  "github_repository": {
    "owner": "draios",
    "name": "sysdig-inspect"
  }
};
