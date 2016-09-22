module.exports = {
	"gateway_id":"1",
   "token-storage":{
      "dbName":"./tokens.sqlite3",
      "createTables":true
   },
   "auth":{
      "response":{
         "success":{
            "url":"http://localhost:8000/",
            "token":"query-params"
         },
         "fail":{
            "url":"/static/error/error.html"
         }
      },
			"github":{
         "clientID": "getYours",
         "clientSecret": "getYours",
         "redirect_path": "http://localhost:3000/auth/callback_github",
         "scope":[
            "notifications"
         ]
      },
      "dropbox":{
         "clientID":"getYours",
         "clientSecret":"getYours",
         "redirect_path":"http://localhost:3000/callback_dropbox",
         "scope":[
            ""
         ]
      },
      "google":{
         "clientID": "getYours",
         "clientSecret": "getYours",
         "redirect_path": "http://localhost:3000/callback_google",
         "scope":[
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
         ]
      },
      "local":{
         "response":{

         },
         "fallback-user-no-pam":{
            "username":"admin",
            "password":"correcthorsebatterystaple"
         }
      },
      "web-id":{

      }
   },
   "tls":{
      "key":"./certs/server.key",
      "cert":"./certs/server.crt"
   }
}
