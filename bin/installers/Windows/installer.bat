@echo off
for /F "tokens=3" %%i in ('reg query HKEY_CURRENT_USER\Environment /v PATH') do (
set NEWPATH=%1;%%i
@echo %NEWPATH%
reg add HKEY_CURRENT_USER\Environment /v PATH /d "%NEWPATH%" /f
)
