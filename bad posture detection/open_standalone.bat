@echo off
echo Opening Bad Posture Detection Web App in your default browser...
echo.

REM Get the full path to the standalone.html file
set "CURRENT_DIR=%~dp0"
set "HTML_FILE=%CURRENT_DIR%standalone.html"

REM Check if the file exists
if not exist "%HTML_FILE%" (
    echo ERROR: Could not find standalone.html in the current directory.
    echo Please make sure you're running this batch file from the correct location.
    goto :end
)

REM Try to open the file with the default browser
echo Attempting to open %HTML_FILE%
start "" "%HTML_FILE%"

echo.
echo If the app doesn't open automatically, please manually open the standalone.html file in your browser.
echo.

:end
pause 