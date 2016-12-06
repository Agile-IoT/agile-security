

## Configuration

To configure the two IDM components, a JSON object is stored in a file within the conf folder. For every subsection, mention whether they are required for the IDM to execute properly or not.
To make this component available as a module. You need to install and run the app in the example folder. This application loads the configuration and starts the web server.

### OAuth2 Configuration  (Mandatory for the use of external IdPs)

Since AGILE-IDM (Web component) behaves as an OAuth2 client, it needs to be configured with the proper credentials to act as a relying party in the protocol.

For each IdP (that will be used by the AGILE gateway owner), a clientID, and a clientSecret are required. To configure them properly, open the conf/agile-ui-conf.js
Then, the following attributes of the configuration need to be updated:

* clientID: OAuth2 client
* clientSecret: OAuth2 secret


Assuming that you have retrieved a **client Id** 5y4rye1946, and a **clientSecret** vz20g6010oxttt0gyqv2, and that the gateway is running in localhost:3000 the github configuration should look like this:

```
"auth":{
	"github":{
		"clientID": "5y4rye1946",
		"clientSecret": "vz20g6010oxttt0gyqv2",
		"host_name": "http://localhost:3000",
		"redirect_path": "/callback_github",
		"initial_path": "/github",
		"final_path":"/static/index.html",
		"site": "https://github.com/login",
		"tokenPath": "/oauth/access_token",
		"scope": "notifications"
	},
 	"google":{
			...
	},
	"dropbox":{
			...
	}
}
```
####Github step by step####

To get the client credentials from github, go to github homepage, log in and click on your profile image. In the drop down menu select **Settings** (see image 1).

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGithub1.PNG" /></td>
		<td><img src="docs/images/tutorialGithub2.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 1
		</td>
		<td>
			Image 2
		</td>
	</tr>
</table>

Then click on OAuth2 applications in the menu on the left hand side (see image 2).  
By default, this option opens the **Authorized applications** site (see image 3). Therefore you have to switch to the second tab **Developer Applications** (see image 4).

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGithub3.PNG" /></td>
		<td><img src="docs/images/tutorialGithub4.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 3
		</td>
		<td>
			Image 4
		</td>
	</tr>
</table>

There you can register a new application. To do so, click on the **Register a new application** button.  
On the next site you have to fill three required fields (see image 5):  
With the first one "**Application name**" you can name your application.
The second flield named **Homepage URL** place the combination of $host_name+$initial_path (http://localhost:3000/github according to the example above).  
For the last field "**Authorization callback URL**", you should place $host_name+$redirect_path (http://localhost:3000/callback_github in the example above).  
After filling the form click the **Register application** button.

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGithub5.PNG" /></td>
		<td><img src="docs/images/tutorialGithub6.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 5
		</td>
		<td>
			Image 6
		</td>
	</tr>
</table>

Now you can scroll to the top to find the **Client ID** and the **Client Secret** fields together with the corresponding values (see image 6).
Use those and place them in the proper configuration fields.

####Google Drive step by step####
To get the client credentials from Google Drive you have to go to the [Google Developer Console](https://console.developers.google.com/).
By default you are redirected to the **Library** menu. If not, simply click onto the **Library** tab on the left hand side.  
To use the Google OAuth2 authentication for IDM you have to enable **Drive API**. In order to do that, click onto the link **Drive API** below the heading **Google Apps APIs** (see image 1).

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGoogle1.PNG" /></td>
		<td><img src="docs/images/tutorialGoogle2.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 1
		</td>
		<td>
			Image 2
		</td>
	</tr>
</table>

If not done yet, you will be asked to create a project in order to enable the API. Therefore click on the **create project** button (see image 2).  
In the following dialog click onto the **Create a project** button.
Enter the name of the project to be created and chose the options you like (see image 3).
<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGoogle3.PNG" /></td>
		<td><img src="docs/images/tutorialGoogle4.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 3
		</td>
		<td>
			Image 4
		</td>
	</tr>
</table>
Make sure you agree the terms of service and a click on the **Create** button will create the project for you. This may take some seconds.
After the creation of the project you are redirected back to the page where you can enable the Drive API (image 2).
On the top right next to **Google Drive API** heading click the **Enable** button.

To be able to use the OAUth2 in IDM you need the client Id and the client secret. To obtain them click onto the **Credentials** tab on the left hand side.
As there are no credentials in the newly created project, yet you are asked to create them. Do so by clicking the button **Create credentials** and choosing **OAuth client ID**.  
First you are asked to create a consent screen which is shown whenever a user is asked to log in in order to authenticate to your app. Therefore click the **Configure consent screen** button (see image 4).  
Here you can put some information (see image 5). The only required fields are the **Email address** and the **Product name** ones. Fill out the formfields and click the **Save** button.
<table align="center">
	<tr>
		<td><img src="docs/images/tutorialGoogle5.PNG" /></td>
		<td><img src="docs/images/tutorialGoogle6.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 5
		</td>
		<td>
			Image 6
		</td>
	</tr>
</table>

Now back on the Credentials site choose **Web application** and fill out the two fields (see image 6).  
In the first one named **Authorized JavaScript origins** you have to put the website that asks the user to authenticate.
As paths are not allowed here you have to use the base URI $host_name (http://localhost:3000 according to the example below).  
With the second field named **Authorized redirect URIs** you specify the url to wich the user will be redirected after authentication.
You should use $host_name+$redirect_path (http://localhost:3000/callback_google in the example below).  
Click the **Create** button and you will receive the needed client Id and client secret.  
Later you can always view the credentials again by clicking on the name of your product on the credentials site.
Use the client Id and client secret and update the following fields in the configuration file:

* clientID: OAuth2 client
* clientSecret: OAuth2 secret
* host_name: host and port where the AGILE gateway is running.

Assuming that you have retrieved a **client Id** 5y4rye1946, and a **clientSecret** vz20g6010oxttt0gyqv2, and that the gateway is running in localhost:3000 the google configuration should look like this:

```
"auth":{
	"github":{
			...
	},
	"google":{
		"clientID": "5y4rye1946",
		"clientSecret": "vz20g6010oxttt0gyqv2",
		"host_name": "http://localhost:3000",
		"redirect_path": "/callback_google",
		"initial_path": "/google",
		"final_path":"/static/index.html",
		"site": "https://accounts.google.com",
		"authorizationPath": "/o/oauth2/auth",
		"tokenPath": "/o/oauth2/token",
		"scope": "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
	},
	"dropbox":{
			...
	}		
}
```
####Dropbox step by step####
To get the needed credentials from dropbox go to the [Dropbox App Console](https://www.dropbox.com/developers/apps) and log in.  
By default you will be directed to the **My apps** page (see image 1).  
There you can create the application for the IDM authentication by clicking the **Create App** Button.

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialDropbox1.PNG" /></td>
		<td><img src="docs/images/tutorialDropbox2.PNG" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 1
		</td>
		<td>
			Image 2
		</td>
	</tr>
</table>

On the next site you have to decide which kind of API you want to use (see image 2). For IDM the **Dropbox API** is enough.  
For the second option you can choose whatever you need.  
Third, you have to enter an unique name for your application.  
Last check the checkbox to confirm that you agree the terms and conditions of the Dropbox API and click the **Create App** button.  
Now your application will be created and you are redirected to its overview (see image 3).

<table align="center">
	<tr>
		<td><img src="docs/images/tutorialDropbox3.PNG" width="600px" /></td>
	</tr>
	<tr align="center">
		<td>
			Image 3
		</td>
	</tr>
</table>

Fill in a redirect URL into the Field named **Redirect URIs** as a combination of $host_name+$redirect_path (http://localhost:3000/callback_dropbox according to the example below) and click the **Add** button.  
On this page you can also find the **App key** and after clicking on **Show** the **App secret**.

Use them and update the following fields in the configuration file:

* clientID: OAuth2 client
* clientSecret: OAuth2 secret
* host_name: host and port where the AGILE gateway is running.

Assuming that you have retrieved a **client Id** 5y4rye1946, and a **clientSecret** vz20g6010oxttt0gyqv2, and that the gateway is running in localhost:3000 the dropbox configuration should look like this:

```
"auth":	{
 	"github":{
			...
 	},
	"google":{
			...
	},
	"dropbox":{
		"clientID": "5y4rye1946",
		"clientSecret": "vz20g6010oxttt0gyqv2",
		"host_name": "http://localhost:3000",
		"redirect_path": "/callback_dropbox",
		"initial_path": "/dropbox",
		"final_path":"/static/index.html",
		"site": "https://www.dropbox.com/",
		"authorizationPath": "/1/oauth2/authorize",
		"tokenPath": "/1/oauth2/token",
		"scope": ""
	}
}
```

### Web-ID TLS Certificate Configuration  (Optional)

web-ID relies on a TLS handshake, therefore IDM needs a certificate for the server side. We have included a self-signed certificate in the certs folder and it is configured by default. But, should you want to place your own certificate (please do!) please change the tls attribute of the configuration object in agile-idm-web-ui/conf/agile-ui.conf.

```
"tls":{
     "key":"../certs/server.key",
     "cert":"../certs/server.crt"
}
```

In this object you can place the path to your own server key and certificate.  However, if you don't update this, you would use the self-signed certificates by default. Which would work, as long as you instruct your browser to do this security exception...

## Local authentication

IDM also offers a local authentication component (not using external IDPs and which does not require a client-side certificate). This component prompts the user for a unsername and password. Depending on your configuration, local authentication works in two ways:

* Compares username and passowrd to the one provided in the configuration (see the configuration example property auth.local.fallback-user-no-pam. This makes sure that IDM runs out of the box.
* Uses the Linux PAM module to authenticate with users that are registered in the linux machine where IDM is running. Since this requires 1) a linux machine and 2) additional libraries in the OS level, this needs to be configured properly.

# Installing

## with PAM

libpam0g-dev is a library required to perform PAM authentication, i.e. native linux authentication. This allows users to provide usernames and passwords to authenticate themselves with the underlying operating system. Since we don't want to force everyone to run this on Linux... by default IDM doesn't install pam authentication.

To use PAM you need to install libpam0g-dev in your linux OS. For instance, in debian or ubuntu you can do:

```
sudo apt-get install libpam0g-dev
```

Afterwards you can install IDM with PAM by typing (if you need to revert the changes to recover the original package json just do git checkout :) ):

```
mv package-pam.json package.json
npm install
```

# Installing without PAM

This is easier:

```
npm install
```

In this case the username and password will be the one provided in the configuration.

# Including IDM-web in your package.json

If you want to include the version without PAM, just add "agile-idm-web-ui": "https://github.com/Agile-IoT/agile-idm-web-ui" to your dependencies. However, keep in mind this installation doesn't integrate PAM. If you have a good idea on how to support this (through npm pacakage.json script or any other way, an issue describint how or a pull request with the change would be welcome).

## Run the Example

Just go to the example folder and run app (after doing npm install there...)

## Try it out


At the moment we have a simple demo that lets you authenticate using different identity providers (github, your linux operating system, a Web-ID certificate) and register an entity (sensor with a name). This registration is just valid for IDM. Soon, we shall do this registration from the AGILE device manager.

To test the demo follow this actions:

* Download and clone this repository
* Configure the components as needed. If you don't want to do any configuration, you can use the Web-ID authentication, or the PAM module out of the box. Otherwise, OAuth2 authentication requires to place the proper client id and secret in the configuration file as described previously.
* Run the components (as already described).
* go to your browser to http://localhost:3000/static/index.html
* authenticate with any mechanism you like
* click on the menu Sensors>Create
* write any name and any id, and then click on create
