:install_app
    node_modules\.bin\bower install

    EXIT /B 0

:install_addons
    cd lib

    cd wsd-core

    npm ci

    cd ..\ui-toolkit

    npm ci

    cd ..\..

    EXIT /B 0

:install_backend
    cd ember-electron\backend

    npm ci

    cd ..\..

    EXIT /B 0

CALL :install_app
CALL :install_addons
CALL :install_backend
