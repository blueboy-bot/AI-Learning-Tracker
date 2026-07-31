@echo off
setlocal
set "APP_NODE=C:\Users\犬力\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "PATH=%APP_NODE%;%PATH%"
set "WRANGLER_LOG_PATH=.wrangler\wrangler.log"
echo AI Learning Tracker is starting...
start "AI Learning Tracker Server" /min cmd /c "node_modules\.bin\vinext.cmd start"
timeout /t 2 /nobreak >nul
start "" http://localhost:3000
echo The app has opened in your browser. Keep this window open while using it.
pause
