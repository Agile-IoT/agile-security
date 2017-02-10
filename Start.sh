#!/bin/bash

CONF=/root/idm.conf/

if [ ! -f "$CONF/agile-idm-core-conf.js" ]; then
  echo "folder not there for conf"
  cp -r rpi-conf/* $CONF
fi

node /opt/agile-idm-web-ui/app.js $CONF
