@echo off
REM Batch script to run React app in development mode
REM This will show full error messages instead of minified ones

echo Starting React app in development mode...
echo This will show full error messages to help debug React Error #31

REM Set NODE_ENV to development
set NODE_ENV=development

REM Start the React development server
npm start

