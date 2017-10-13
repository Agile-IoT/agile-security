module.exports = {
  "gateway_id": "1",
  "token-storage": {
    "dbName": "/root/idm.db/database_web",
    "createTables": true
  },
  "failureRedirect": "/login",
  "auth": {
    "github": {
      "clientID": "getGithubId",
      "clientSecret": "getGithubSecret",
      "redirect_path": "http://localhost:3000/auth/callback_github",
      "scope": [
        "notifications"
      ]
    },
    "dropbox": {
      "clientID": "getDropboxId",
      "clientSecret": "getDropboxSecret",
      "redirect_path": "http://localhost:3000/auth/callback_dropbox",
      "scope": [
        ""
      ]
    },
    "google": {
      "clientID": "getGoogleId",
      "clientSecret": "getGoogleSecret",
      "redirect_path": "http://localhost:3000/auth/callback_google",
      "scope": [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    }
  },
  "tls": {
    "key": "./certs/server.key",
    "cert": "./certs/server.crt"
  },
  "http_port": 3000,
  "https_port": 1444,
  "https_port_with_client": 1443,
  "enabledStrategies": ["agile-local"],
  "cors": ["http://set-automatically:2000"],
  "gui": {
    "/device": {
      "hidden": true,
      "addNew": false,
      "attributes": {
        "id": {
          "notEditable": true
        },
        "owner": {
          "notEditable": true
        }
      }
    },
    "/group": {
      "name": "Groups",
      "addNew": true,
      "attributes": {
        "group_name": {
          "name": "group name",
          "notEditable": true
        }
      }
    },
    "/user": {
      "name": "User",
      "attributes": {
        "id": {
          "notEditable": true
        },
        "owner": {
          "notEditable": true
        },
        "user_name": {
          "notEditable": true,
          "name": "user name"
        },
        "auth_type": {
          "notEditable": true,
          "name": "authentication method"
        },
        "password": {
          "notEditable": true,
          "hidden": true
        },
        "groups": {
          "notEditable": true,
          "hidden": true
        }
      }
    },
    "/client": {
      "name": "Client",
      "attributes": {
        "id": {
          "notEditable": true
        },
        "owner": {
          "notEditable": true
        },
        "clientSecret": {
          "notEditable": true,
          "name": "client secret"
        },
        "redirectURI": {
          "notEditable": true,
          "name": "Oauth2 callback"
        }
      }
    },
    "/gateway": {
      "hidden": true,
      "addNew": false
    }
  }
}
