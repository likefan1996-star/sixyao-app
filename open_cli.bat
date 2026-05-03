@echo off
set CLI_PATH=D:\
setlocal enabledelayedexpansion
for /f "delims=" %%i in ('dir /b /ad "D:\*web*" 2^>nul') do set CLI_FOLDER=%%i
endlocal & set CLI_PATH=D:\!CLI_FOLDER!
echo y|"!CLI_PATH!\cli.bat" open --project "D:\liuyao-app"
