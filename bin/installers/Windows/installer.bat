@echo off
pushd %CD%
cd %~dp0
node ../../../extract http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com/asteroid-oracle_Windows_0.1-0_x64.tar.gz ../../../node_modules
cd ../../../node_modules/instantclient
set ORAPATH=%CD%\vc11;%CD%
@echo Oracle Path: %ORAPATH%

for /F "tokens=3" %%i in ('reg query "HKEY_CURRENT_USER\Environment" /v PATH') do (
set NEWPATH=%ORAPATH%;%%i
@echo New Path: %NEWPATH%
reg add HKEY_CURRENT_USER\Environment /v PATH /d "%NEWPATH%" /f
)
popd
