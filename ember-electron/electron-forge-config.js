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
    "overwrite": true,
    "extendInfo": {
      "CFBundleTypeRole": "Viewer",
      "CFBundleTypeIconFile": "electron.icns",
      "UTExportedTypeDeclarations": [
        {
          "UTTypeConformsTo": [ "public.data" ],
          "UTTypeDescription": "Sysdig capture file",
          "UTTypeIdentifier": "com.sysdig.capturefile",
          "UTTypeTagSpecification":
            {
              "public.filename-extension": [ "scap" ]
            }
        }
      ],
      "CFBundleDocumentTypes": [
        {
         "CFBundleTypeIconFiles": [],
         "CFBundleTypeName": "Sysdig capture file",
         "LSHandlerRank": "Owner",
         "LSItemContentTypes": [ "com.sysdig.capturefile" ]
        }
      ]
    }
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
    "productDescription": "A powerful opensource interface for container troubleshooting and security investigation",
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
    "productDescription": "A powerful opensource interface for container troubleshooting and security investigation",
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
