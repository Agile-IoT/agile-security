#!/bin/bash

CONF=/root/idm.conf/


if [ ! -f "$CONF/agile-idm-core-conf.js" ]; then
  echo "folder not there for conf"
  cp -r rpi-conf/* $CONF
fi

if [ ! -f "$CONF/agile-pdp-conf.js" ]; then
  echo "folder not there for conf"
  cp -r rpi-conf/agile-pdp-conf.js $CONF/agile-pdp-conf.js
fi

node /opt/agile-idm-web-ui/app.js $CONF
