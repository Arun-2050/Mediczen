@echo off
echo Installing Backend Dependencies...
cd /d "c:\Users\DEAD_BLUE\Documents\Medical Doc Website\backend"
call npm install --no-fund --no-audit

echo Installing Frontend Dependencies...
cd /d "c:\Users\DEAD_BLUE\Documents\Medical Doc Website\frontend"
call npm install --no-fund --no-audit

echo Installation Complete!
