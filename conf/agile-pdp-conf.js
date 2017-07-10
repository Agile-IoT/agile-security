//{"target":{"type":"user"},"locks":[{"path":"hasId","args":["$owner"]}]
module.exports = {
  "default_actor": [
    // actions of an actor are not restricted a priori
    {
      target: {
        type: "/any"
      }
    }, {
      source: {
        type: "/any"
      }
    }
  ],
  "management": {
    "top_level_policy": {
      flows: [
        //this policy requires some fake role to ensure that we don't let actions that are not known execute.
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "super_admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "super_admin"]
          }]
        }

      ]
    },
    "specific_policies": {
      "device": [ // policy to create new devices
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "protocol": [ // policy to create new devices
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "discovery": [ // policy to create new devices
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],

    }
  },
  "device": {
    "top_level_policy": {
      flows: [
        //this policy requires some fake role to ensure that we don't let actions that are not known execute.
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "super_admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "super_admin"]
          }]
        }

      ]
    },
    "specific_policies": {
      "status": [
        // the property can only be read by the user itself
        {
          target: {
            type: "/any"
          }
        }
      ],
      "components": [
        // components can only be read or written by owner or admin
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "connection": [
        // components can only be read or written by owner or admin
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "execute": [
        // components can only be read or written by owner or admin
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "subscribe": [
        // components can only be read or written by owner or admin
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
      "description": [ //device manager call
        // components can only be read or written by owner or admin
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          target: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "isOwner"
          }]
        },
        {
          source: {
            type: "/user"
          },
          locks: [{
            lock: "attrEq",
            args: ["role", "admin"]
          }]
        }
      ],
    }
  }

};
