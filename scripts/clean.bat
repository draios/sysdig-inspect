:clean_app
    rmdir /S /Q bower_components
    rmdir /S /Q dist
    rmdir /S /Q electron-out
    rmdir /S /Q node_modules
    rmdir /S /Q tmp
    EXIT /B 0

:clean_addons
    cd lib\wsd-core
    rmdir /S /Q node_modules

    cd ..\..

    cd lib\ui-toolkit
    rmdir /S /Q node_modules

    cd ..\..

    EXIT /B 0

:clean_backend
    cd ember-electron\backend

    rmdir /S /Q node_modules

    cd ..\..

    EXIT /B 0

:clean_bundle
    cd ember-electron\resources

    rmdir /S /Q sysdig

    cd ..\..

    EXIT /B 0

CALL :clean_app
CALL :clean_addons
CALL :clean_backend
CALL :clean_bundle
