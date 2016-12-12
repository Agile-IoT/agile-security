//{"target":{"type":"user"},"locks":[{"path":"hasId","args":["$owner"]}]
module.exports = {
  "storage": {
    "dbName": "./database_"
  },
  "top_level_policy": {
    "policy": [
      /*
      always I have entity_id and entity_type available (both are the pk)
      user:{
        entity_id,
        entity_type,
        user_name,
        auth_type,
        role,
        *may have password
      }
      for all attributes:
        only owner can write
        everyone can read
      */
    ]
  },
  "attribute_level_policies": {
    "user": {
      "password": {
        "policy": [
          // only user with id === $owner can read
          // users with attribute role === admin can write, and user with id === $owner can write too.
        ]
      },
      "role": {
        "policy": [
          // only users with attribute role === admin can write to role
          // everyone can read
        ],
      }
    },
    "sensor": {
      "credentials": {
        "policy": [
          // only user with id === $owner can read
          // only user with id === $owner can write
        ],
        "rule": {
          "replace": "owner"
        }
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
