#!/bin/bash

#update configuration to put database in /etc/idm in the image, which
# would map to the conf folder in the host.
source env.sh
NAME=idm
docker rm $NAME
docker run \
    -p 3000:3000 \
    -p 1444:1444 \
    -p 1443:1443 \
   --name $NAME \
   -v  $LOCAL_DOCKER_CONF:$DOCKER_CONF \
   -v  $DB:$DOCKER_DB \
   -i \
   -e DOCKER_CONF=$DOCKER_CONF \
   -t agile-idm
