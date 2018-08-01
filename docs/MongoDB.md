#Configuration AGILE-Security
To use MongoDB in AGILE security first start and configure MondoDB. If you run it through the stack you can use the following configurtion:

## Intel

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

## ARM 

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
 