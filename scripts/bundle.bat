::
:: Parameters:
::
:: [sysdig path]     run backend with custom sysdig executables path
::

IF "%1"=="" (
    SET SYSDIG_PATH=..\sysdig\build\Release
) ELSE (
    :: or use custom path
    SET SYSDIG_PATH=%1
)

:copy_sysdig
cd ember-electron\resources

xcopy /E /Y /I ..\..\%SYSDIG_PATH% sysdig

md sysdig\capture-samples
copy ..\..\capture-samples\502Error.scap sysdig\capture-samples\
copy ..\..\capture-samples\404Error.scap sysdig\capture-samples\

cd ..\..
EXIT /B 0

CALL :copy_sysdig
