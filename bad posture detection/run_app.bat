@echo off
echo Starting Bad Posture Detection Web App...
echo.
echo Checking Python installation...
where python
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not found in PATH. Please make sure Python is installed correctly.
    goto :end
)

echo.
echo Python version:
python --version
echo.

echo Checking required modules...
python -c "import flask; print(f'Flask version: {flask.__version__}')"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Flask is not installed correctly. Trying to reinstall...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        goto :end
    )
)

echo.
echo Starting Flask application...
python app.py

:end
echo.
echo Press any key to exit...
pause 