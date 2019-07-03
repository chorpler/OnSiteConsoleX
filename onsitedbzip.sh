#!/bin/bash

set -e

# export APPDIR="~/Library/Application Support/OnSiteConsoleX"
export APPDIR=~/Library/Application\ Support/OnSiteConsoleX
export DBZIPFILE=~/onsitedb/onsiteconsolex.db.zip

pushd "${APPDIR}"
if [ -f $DBZIPFILE ]; then
  ls -lh ~/onsitedb/onsiteconsolex.db*
  read -p "Enter number for backing up old onsiteconsolex.db.zip (with leading zero, e.g. 015): " NEWNUMBER
  if [ -z $NEWNUMBER ]; then
    echo "No number entered! Exiting."
    exit
  else
    echo "Renaming to onsiteconsolex.db${NEWNUMBER}.zip ..."
    mv ~/onsitedb/onsiteconsolex.db.zip ~/onsitedb/onsiteconsolex.db${NEWNUMBER}.zip
  fi
fi
echo "Zipping up OnSiteConsoleX database directories at: '${APPDIR}' ..."
7z a ~/onsitedb/onsiteconsolex.db.zip db -mx9
sshpass -p "Trucks-N-sichRour21stTry" scp ~/onsitedb/onsiteconsolex.db.zip u58978311-SESA-Admin@sesafleetservices.com:/onsitedb/
echo "put /Users/admin/onsitedb/onsiteconsolex.db.zip /onsitedb/" | sshpass -p "Trucks-N-sichRour21stTry" sftp u58978311-SESA-Admin@sesafleetservices.com
popd
# if [%NEWNUMBER%] == [] goto NORENAMENUMBER
# # echo Renaming to onsiteconsolex.db%NEWNUMBER%.zip, hit BREAK to cancel ...
# # pause
# ren \onsitedb\onsiteconsolex.db.zip onsiteconsolex.db%NEWNUMBER%.zip
# 7z a \onsitedb\onsiteconsolex.db.zip db -mx9
# pscp -pw Trucks-N-sichRour21stTry \onsitedb\onsiteconsolex.db.zip u58978311-SESA-Admin@sesafleetservices.com:/onsitedb/
# goto FINISHED
# :NORENAMENUMBER
# echo No number entered to rename onsiteconsolex.db.zip. Quitting.
# :FINISHED
# echo Done!
# popd