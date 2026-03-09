@echo off
echo.
echo ========================================
echo   GitHub OAuth Setup
echo ========================================
echo.
echo Please enter your NEW credentials from GitHub:
echo.

set /p CLIENT_ID="Enter Client ID: "
set /p CLIENT_SECRET="Enter Client Secret: "

echo.
echo # GitHub OAuth Configuration > .env
echo # Create a GitHub OAuth App at: https://github.com/settings/developers >> .env
echo # Set Authorization callback URL to: http://localhost:3001/auth/github/callback >> .env
echo. >> .env
echo GITHUB_CLIENT_ID=%CLIENT_ID% >> .env
echo GITHUB_CLIENT_SECRET=%CLIENT_SECRET% >> .env

echo.
echo ========================================
echo   Configuration Updated!
echo ========================================
echo.
echo Client ID: %CLIENT_ID%
echo Client Secret: %CLIENT_SECRET:~0,20%...
echo.
echo Next steps:
echo 1. Restart servers: npm run dev:all
echo 2. Open http://localhost:5174
echo 3. Click GitHub login
echo.
pause
