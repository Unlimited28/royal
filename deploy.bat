@echo off
echo ========================================================
echo Royal Ambassadors Portal - Automatic Deployment Script
echo ========================================================
echo.

echo 1. Initializing Git Repository...
call git init

echo.
echo 2. Adding all files...
call git add .

echo.
echo 3. Committing changes...
call git commit -m "Initial commit of Royal Ambassadors Portal frontend"

echo.
echo 4. Configuring Remote Origin (https://github.com/stephensmithy28/8dr.git)...
call git remote remove origin 2>nul
call git remote add origin https://github.com/stephensmithy28/8dr.git

echo.
echo 5. Renaming branch to main...
call git branch -M main

echo.
echo 6. Pushing to GitHub...
call git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo Deployment Successful! 
    echo Your code is now live at: https://github.com/stephensmithy28/8dr
) else (
    echo Deployment Failed. Please check the errors above.
)
echo ========================================================
pause
