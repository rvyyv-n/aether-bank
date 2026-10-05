@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333" ^| findstr "LISTENING"') do (
    echo Stopping PID %%a...
    taskkill /f /pid %%a
)
echo Server stopped.
