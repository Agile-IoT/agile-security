#!/bin/bash

CONF=./my-conf

if [ ! -d "$CONF" ]; then
  echo "folder not there for conf"
  cp -r rpi-conf/ $CONF
fi

node /opt/agile-idm-web-ui/app.js $CONF
