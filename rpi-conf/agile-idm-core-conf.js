var path = process.cwd();
module.exports = {
  "storage": {
    "dbName": "/root/idm.db/database_"
  },
  upfront_storage: {
    module_name: "agile-upfront-leveldb",
    type: "external",
    dbName: "/root/idm.db/database_",
    collection: "policies",
  },
  upfront_locks: path + "/node_modules/agile-upfront-locks/Locks",
  upfront_actions: path + "/node_modules/agile-upfront-locks/Actions",
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
    },
    //default policy for policy field
    "policy-policy-root": {
      attribute: "policies",
      policy: [{
          op: "read"
        },
        // by all users with role admin
        {
          op: "read",
          locks: [{
            lock: "hasType",
            args: ["/user"]
          }, {
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
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
      readAll: [{
        op: "read"
      }]
    },
    //restricts the policy composition tree (policy.policy) read only  = 1 (policy.policy.policy) = 2
    //in other terms 1 does not allow for policy updates, 2 allows for policy update but no meta-policy update, etc.
    "policy-level": 1,
    "action-policy-root": {
      attribute: "actions",
      policy: [{
          op: "read",
          locks: [{
            lock: "hasType",
            args: ["/user"]
          }, {
            lock: "isOwner"
          }]
        },
        // by all users with role admin
        {
          op: "read",
          locks: [{
            lock: "hasType",
            args: ["/user"]
          }, {
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
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
      ]
    },
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
        "policies.role": [
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
            op: "read",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
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
        ],
        "policies.credentials": [{
            op: "read"
          },
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
      },
      "client": {
        "clientSecret": [{
            op: "read",
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
              lock: "isOwner"
            }]
          }
        ],
        "policies.clientSecret": [{
            op: "read"
          },
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
      },
      "device": {
        "credentials": [
          // the property can only be read by the user itself
          {
            op: "read",
            locks: [{
              lock: "hasType",
              args: ["/user"]
            }, {
              lock: "isOwner"
            }]
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
        ],
        "policies.credentials": [{
            op: "read"
          },
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
  "forbidden-attribute-names": [
    'id',
    'type',
    'owner',
    'groups',
    'entities',
    'actions',
    'policies'
  ],
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
        "type": "string",
        "enum": ["agile-local"]
      },
      "password": {
        "type": "string"
      },
      "role": {
        "type": "string",
        "enum": ["admin"]
      },
      "credentials": {
        "type": "object",
        "additionalProperties": true
      }
    },
    "required": ["user_name", "auth_type"]
  }, {
    "id": "/client",
    "type": "object",
    "additionalProperties": false,
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
    "required": ["name"]
  }, {
    "id": "/group",
    "type": "object",
    "properties": {
      "group_name": {
        "type": "string"
      }
    },
    "required": ["group_name"]
  }, {
    "id": "/gateway",
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "required": ["name"]
  }, {
    "id": "/database",
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "host": {
        "type": "string"
      },
      "user": {
        "type": "string"
      },
      "password": {
        "type": "string"
      },
      "database": {
        "type": "string"
      }
    },
    "required": ["host", "user", "password", "database"]
  }],
  "configure_on_boot": {
    "user": [{
      "user_name": "agile",
      "auth_type": "agile-local",
      "role": "admin",
      "password": "secret",
      "credentials": {
        "xively": {
          "xivelymaster": "NU9grueAtYdQE0L7DdFlID3NBZuQn7tyyNvjXUvqoQnJ2rox",
          "xivelyproduct": "Y1o-jUXIj66T1Ekb_Tjx",
          "xivelysecret": "067d1c0ad522fa0315782888b4cf89741b0369ec"
        }
      }
    }],
    "client": [{
      "id": "AGILE-OSJS",
      "name": "AGILE-OSJS",
      "redirectURI": "http://set-automatically:8000/"
    }],
    "gateway": [{
      "id": "self",
      "name": "local gateway"
    }]
  },
  "audit": {
    dbName: "/root/idm.db/database_",
    //according to https://www.npmjs.com/package/timeframe-to-seconds,
    timeframe: '1m',
    //DETAILED=0, ONLY_IMPORTANT_STUFF=1
    level: 1,
    regex: '^actions'
    //regex in case we want to log only certain
  }

};
