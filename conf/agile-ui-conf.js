module.exports = {
  "gateway_id": "1",
  "token-storage": {
    "dbName": "./database_web",
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
  "enabledStrategies": ["agile-local", "github", "google", "webid"],
  "cors": ["http://localhost:8080"]
}
