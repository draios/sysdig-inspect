:install_app
    node_modules\.bin\bower install

    EXIT /B 0

:install_addons
    cd lib

    cd wsd-core

    npm install

    cd ..\ui-toolkit

    npm install

    cd ..\..

    EXIT /B 0

:install_backend
    cd ember-electron\backend

    npm install

    cd ..\..

    EXIT /B 0

CALL :install_app
CALL :install_addons
CALL :install_backend
