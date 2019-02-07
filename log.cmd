@echo off
if not exist "%APPDATA%\OnSiteConsoleX\log.log" touch "%APPDATA%\OnSiteConsoleX\log.log"
tail -f "%APPDATA%\OnSiteConsoleX\log.log"
