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
  "gui":{
    "/device":{
      "hide": true,
      "addNew": false,
      "attributes":{
          "id":{
            "editable":false
          },
          "owner":{
            "editable":false
          }
      }
    },
    "/user":{
      "attributes":{
        "id":{
          "editable":false
        },
        "owner":{
          "editable":false
        },
        "user_name":{
          "editable":false,
          "name":"user name"
        },
        "auth_type":{
          "editable":false,
          "name":"authentication method"
        },
        "password":{
          "editable":false,
          "hidden":true
        }
      }
    },
    "/client":{
      "attributes":{
        "id":{
          "editable":false
        },
        "owner":{
          "editable":false
        },
        "clientSecret":{
          "editable":false,
          "name":"client secret"
        },
        "redirectURI":{
          "editable":false,
          "name":"Oauth2 callback"
        }
      }
    },
    "/gateway":{
      "hide": true,
      "addNew": false
    }
  }
}
