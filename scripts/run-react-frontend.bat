@echo off

:: Start the backend server in a separate window
start cmd /c "npm run start:win:backend"

:: Wait for the backend to start
echo Waiting for backend server to start...
timeout /t 3 /nobreak > nul

:: Start the React frontend
echo Starting React frontend...
npm run start:react
