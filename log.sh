#!/bin/sh

LOGFILE="~/Library/Logs/OnSiteConsoleX/log.log"

if [ -e $LOGFILE ]; then
  touch "$LOGFILE"
fi
tail -f "$LOGFILE"