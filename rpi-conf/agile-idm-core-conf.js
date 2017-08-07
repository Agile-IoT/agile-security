//{"target":{"type":"user"},"locks":[{"path":"hasId","args":["$owner"]}]
var conf = {
  "storage": {
    "dbName": "/root/idm.db/database_"
  },
  upfront_storage: {
        module_name: "agile-upfront-leveldb",
        type: "external",
        dbName: "/root/idm.db/pap_database",
        collection: "policies",
  },
  "policies": {
    "create_entity_policy": [
      // actions of an actor are not restricted a priori
      {
        op: "write"
      },
      {
        op: "read"
      }
    ],
    "top_level_policy": [

        // all properties can be read by everyone
        {
          op: "read"
        },
        // all properties can only be changed by the owner of the entity
        {
          op: "write",
          locks: [{
            lock: "hasType",
            args: ["/user"]
          }, {
            lock: "isOwner"
          }]
        },
        {
          op: "write",
          locks: [{
            lock: "hasType",
            args: ["/user"]
          }, {
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }

      ],
      //specify what should happen if the policy does not comply
      actions: {
        "read": [{
          action: "delete"
        }]
      }
    ,
    "attribute_level_policies": {
      "user": {
        "password": [
          // the property can only be read by the user itself
          {
            op: "read",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
          }
          // the property can be set by the user itself and
          , {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
          },
          // by all users with role admin
          {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "attrEq",
              args: ["role", "admin"]
            }]
          }
        ],
        "role": [
          // can be read by everyone
          {
            op: "read"
          },
          // can only be changed by users with role admin
          {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "attrEq",
              args: ["role", "admin"]
            }]
          }
        ],
        "credentials": [
          // the property can only be read by the user itself
          {
            op: "read"
          },
          // the property can be set by the user itself and
          {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
          },
          {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "attrEq",
              args: ["role", "admin"]
            }]
          }
        ]
      },
      "device": {
        "credentials": [
          // the property can only be read by the user itself
          {
            op: "read"
          },
          // the property can be set by the user itself and
          {
            op: "write",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
          }
        ]
      }
    }
  },
  "schema-validation": [{
    "id": "/device",
    "additionalProperties": false,
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "credentials": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "dropbox": {
            "type": "string"
          }
        }
      }
    },
    "required": ["name"]
  }, {
    "id": "/user",
    "type": "object",
    "properties": {
      "user_name": {
        "type": "string"
      },
      "auth_type": {
        "type": "string"
      },
      "password": {
        "type": "string"
      },
      "role": {
        "type": "string"
      },
      "credentials": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "dropbox": {
            "type": "string"
          }
        }
      }
    },
    "required": ["user_name", "auth_type"]
  }, {
    "id": "/client",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "clientSecret": {
        "type": "string"
      },
      "redirectURI": {
        "type": "string"
      }
    },
    "required": ["name", "redirectURI"]
  }],
  "configure_on_boot": {
    "user": {
      "username": "agile",
      "auth_type": "agile-local",
      "role":"admin",
      "password": "secret",
      "credentials":{
        "xively":{
          "xivelymaster":"NU9grueAtYdQE0L7DdFlID3NBZuQn7tyyNvjXUvqoQnJ2rox",
          "xivelyproduct":"Y1o-jUXIj66T1Ekb_Tjx",
          "xivelysecret":"067d1c0ad522fa0315782888b4cf89741b0369ec"
          }
        }
    },
    "client": {
      "id": "AGILE-OSJS",
      "name": "AGILE-OSJS",
      "uri": "http://agilegw.local:8000/"
    }
  }

};

//quick fix to enable containers to reference the name of the gateway...
//this should be handled more gracefully in the future.
var fs = require('fs');
var hostname = fs.readFileSync('/etc/hostname');
hostname = hostname.toString().trim();
if(process.env.AGILE_HOST){
   conf.configure_on_boot.client.uri = "http://"+process.env.AGILE_HOST+":8000/";
} else if(hostname){
   conf.configure_on_boot.client.uri = "http://"+hostname+".local:8000/";
}
console.log(conf.configure_on_boot.client.uri);

module.exports = conf;
