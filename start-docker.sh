#!/bin/sh

#update configuration to put database in /etc/idm in the image, which
# would map to the conf folder in the host.

NAME=idm-agile
docker rm $NAME
docker run \
    -p 3000:3000 \
    -p 1444:1444 \
    -p 1443:1443 \
   --name $NAME \
   -v  `pwd`/conf:/etc/idm \
   -i \
   -t idm
