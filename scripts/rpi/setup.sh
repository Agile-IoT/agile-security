#!/bin/bash
source env.sh
#location of the scripts folder to execute idm
SCRIPTS=../
#rewrite configuration to point to the local database now
node port-conf-file.js  $CONF $DB/database_ $LOCAL_CONF
#rewrite configuration to point to the databases fron the docker image
node port-conf-file.js  $CONF $DOCKER_DB/database_ $LOCAL_DOCKER_CONF
node $SCRIPTS/createUser.js --username=bob --password=secret  --auth=agile-local --role=admin --config=$LOCAL_CONF/agile-idm-core-conf.js
node $SCRIPTS/createClient.js --client=OSjs --name="AGILE-OSJS" --secret="Ultrasecretstuff" --owner=bob --auth_type=agile-local --uri=http://agilegw.local:8000/ --config=$LOCAL_CONF/agile-idm-core-conf.js
node $SCRIPTS/createClient.js --client=MyAgileClient3 --name="My first example as IDM client" --secret="Ultrasecretstuff" --owner=bob --auth_type=agile-local --uri=http://agilegw.local:3002/auth/example/callback --config=$LOCAL_CONF/agile-idm-core-conf.js


