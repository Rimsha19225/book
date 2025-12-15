@echo off
REM Simple deployment script to copy built files to a local directory
REM This can be used as an alternative to GitHub Pages deployment

set OUTPUT_DIR=%~1

if "%OUTPUT_DIR%"=="" (
    echo Usage: %0 ^<output_directory^>
    echo Example: %0 C:\temp\gh-pages
    exit /b 1
)

echo Building the site...
cd frontend
npm run build

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Copying built files to %OUTPUT_DIR%...
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
xcopy /E /I /Y build "%OUTPUT_DIR%"

echo Deployment completed! Files copied to %OUTPUT_DIR%
echo You can now upload these files to your web server or GitHub Pages manually.