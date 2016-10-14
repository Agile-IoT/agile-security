#!/bin/sh

NAME=idm-agile
docker rm $NAME
docker run \
    -p 3000:3000 \
   --name $NAME \
   -v  `pwd`/example/conf:/etc/idm \
   -i \
   -t idm

