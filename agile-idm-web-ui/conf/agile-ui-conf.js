module.exports = {
	"login":{
		"site": "/static/index.html",
		"exclude_prefix":["/static/"]
	},
	"token-storage":{
		"dbName":"./tokens.sqlite3",
		"createTables":true
	},
	"auth":{
 			  "github":{
					"clientID": "getGithubId",
					"clientSecret": "getGithubSecret",
					"redirect_path": "http://localhost:3000/callback_github",
					"scope": ["notifications"]
       },
       "dropbox":{
            "clientID":  "getDropboxId",
            "clientSecret": "getDropboxSecret",
            "redirect_path": "http://localhost:3000/callback_dropbox",
						"scope": [""]
       },
       "google":{
            "clientID": "getGoogleId",
            "clientSecret": "getGoogleSecret",
						"redirect_path": "http://localhost:3000/callback_google",
            "scope": ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
       },
		"pam":{
			"initial_path":"/pam_unix",
			"host_name": "http://localhost:3000"
		},
		"web-id":{
			"initial_path":"/web_id",
			"host_name": "http://localhost:3000",
			"final_path":"/static/index.html"
		}
	},
	"tls":{
		"key":"../certs/server.key",
		"cert":"../certs/server.crt"
	}
}
