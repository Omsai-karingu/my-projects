@echo off
echo Opening Camera Test Page in your default browser...
echo.

REM Get the full path to the test_camera.html file
set "CURRENT_DIR=%~dp0"
set "HTML_FILE=%CURRENT_DIR%test_camera.html"

REM Check if the file exists
if not exist "%HTML_FILE%" (
    echo ERROR: Could not find test_camera.html in the current directory.
    echo Please make sure you're running this batch file from the correct location.
    goto :end
)

REM Try to open the file with the default browser
echo Attempting to open %HTML_FILE%
start "" "%HTML_FILE%"

echo.
echo If the camera test page doesn't open automatically, please manually open the test_camera.html file in your browser.
echo.
echo This test will help diagnose any issues with camera access for the Bad Posture Detection app.
echo.

:end
pause 