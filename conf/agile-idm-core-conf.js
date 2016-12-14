//{"target":{"type":"user"},"locks":[{"path":"hasId","args":["$owner"]}]
module.exports = {
  "storage": {
    "dbName": "database_"
  },
  "policies": {
    "dbName": "./policies.json",
    "create_entity_policy": [
      // actions of an actor are not restricted a priori
      {
        target: {
          type: "any"
        }
      }, {
        source: {
          type: "any"
        }
      }
    ],
    "top_level_policy": [
      // all properties can be read by everyone
      {
        target: {
          type: "any"
        }
      },
      // all properties can only be changed by the owner of the entity
      {
        source: {
          type: "user"
        },
        locks: [{
          lock: "isOwner"
        }]
      }, {
        source: {
          type: "user"
        },
        locks: [{
          lock: "attrEq",
          args: ["role", "admin"]
        }]
      }
    ],
    "attribute_level_policies": {
      "user": {
        "password": [
          // the property can only be read by the user itself
          {
            target: {
              type: "user"
            },
            locks: [{
              lock: "isOwner"
            }]
          },
          // the property can be set by the user itself and
          {
            source: {
              type: "user"
            },
            locks: [{
              lock: "isOwner"
            }]
          },
          // by all users with role admin
          {
            source: {
              type: "user"
            },
            locks: [{
              lock: "attrEq",
              args: ["role", "admin"]
            }]
          }
        ],
        "role": [
          // can be read by everyone
          {
            target: {
              type: "any"
            }
          },
          // can only be changed by users with role admin
          {
            source: {
              type: "user"
            },
            locks: [{
              lock: "attrEq",
              args: ["role", "admin"]
            }]
          }
        ]
      },
      "sensor": {
        "credentials": [
          // the property can only be read by the user itself
          {
            target: {
              type: "user"
            },
            locks: [{
              lock: "isOwner"
            }]
          },
          // the property can be set by the user itself and
          {
            source: {
              type: "user"
            },
            locks: [{
              lock: "isOwner"
            }]
          }
        ]
      }

    }
  },
  "schema-validation": [{
    "id": "/sensor",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "credentials": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "system": {
              "type": "string"
            },
            "value": {
              "type": "string"
            }
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
      "role":{
        "type":"string"
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
    "required": ["name", "clientSecret", "redirectURI"]
  }]
};
