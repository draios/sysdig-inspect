::
:: Parameters:
::
:: [sysdig path]     run backend with custom sysdig executables path
::

IF "%1"=="" (
    SET SYSDIG_PATH="..\..\..\sysdig\build\Release"
) ELSE (
    :: or use custom path
    SET SYSDIG_PATH=$1
)

:run
	cd ember-electron\backend

	npm start --- -p=%SYSDIG_PATH%

	cd ..\..

	EXIT /B 0


CALL :run
