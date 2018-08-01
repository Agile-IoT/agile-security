#Configuration AGILE-Security
To use MongoDB in AGILE security first start and configure MondoDB. If you run it through the stack you can use the following configurtion:

## Container
### Intel

      mongo:
        image: mongo:3.2.15
        environment:
          MONGO_INITDB_ROOT_USERNAME: agile
          MONGO_INITDB_ROOT_PASSWORD: secret
        expose:
          - 27017:27017/tcp
        restart: always
        volumes:
          - $DATA/mongo/db/:/data/db
        command: mongod --auth

The user ```agile:secret``` is added to the database ```admin``` and ca be used to log in the database.

### ARM 

      mongo:
        build: https://github.com/Agile-IoT/rpi-mongodb.git
        expose:
          - 27017:27017/tcp
        restart: always
        volumes:
          - $DATA/mongo/db/:/data/db
This builds the MongoDB container from https://github.com/Agile-IoT/rpi-mongodb, which uses MongoDB v3.2.15.
      
After starting the container, you need to log in to the database, e. g. through a mongodb-client, and add a user. Initially the database does not use any password, so you can follow the following instructions:

    mongo --host localhost --port 27017
    use admin
    db.createUser({user: "agile", pwd: "secret", roles: ["dbAdminAnyDatabase"]})

## Configure AGILE-Security
### agile-idm-core-conf.js
In the configuration file you find the following sections:

     storage: {
        dbName: "admin", //for mongodb
        type: "mongodb", //leveldb or mongodb
        host: "mongo",
        port: 27017,
        password: "secret",
        user: "agile",
        entityCollection: "entities",
        groupCollection: "groups",
      },
      upfront_storage: {
        type: "mongodb",
        host: "mongo",
        port: 27017,
        password: "secret",
        user: "agile",
        dbName: "admin",
        collection: "policies"
      },
      
The ```storage``` section is used for storing the data of entities and groups. ```upfront_storage``` is used to store the policies.

The configuration above uses a MongoDB instance at the host ```mongo``` on port ```27017```. Within that it uses the ```admin``` database. 
To log in it uses the user ```agile``` with the secret ```secret```.

If agile-security should use leveldb, the following configuration can be used:

     storage: {
        dbName: "database_", //for leveldb
        type: "leveldb", //leveldb or mongodb
      },
     upfront_storage: {
       module_name: "agile-upfront-leveldb",
       type: "external",
       dbName: "database_",
       collection: "policies",
     },
     
### agile-ui-conf.js
In the configuration file you find the following section:

     "token-storage": {
       "type": "mongodb", //leveldb or mongodb
       "host": "mongo",
       "port": 27017,
       "password": "secret",
       "user": "agile",
       "dbName": "admin",
       "collection": "token"
     },

This used for storing the tokens.
To use leveldb instead, the following configuration can be used:

     "token-storage": {
       "dbName": "./database_web", //for leveldb
       "createTables": true, //for leveldb
       "type": "leveldb", //leveldb or mongodb
     },