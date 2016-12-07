# User Authentication

AGILE IDM behaves as an Identity Provider for applications (Oauth2 clients). In its current state AGILE IDM supports the authorization code flow of Oauth2, and it can use the following authentication mechanisms:

* Local username and password
* PAM (Pluggable authentication modules) UNIX authentication
* WebID
* Google
* Github

Every user has an id composed of the username and authentication type. During the login process, every strategy verifies
that a user with the particular username and authentication type has been registered in oder to allow the user to log in. This ensures that only allowed users log into the gateway; otherwise, anyone with a Github or Google account would log in.

Every strategy offered as part of agile-idm-web-ui is represented by an authentication type name. The authentication type name is comprised of the lowercase letters corresponding to the strategy (e.g., google, webid, github, pam, agile-local). Also, a file with the passport stragy calls name needs to be placed in the folder lib/auth/providers. Likewise a file with the same name needs to be locade in the routes/providers folder. In the latter, the proper routes required for the authentication type are mounted in the authentication express router.

## Authentication Types

The authentication type used to register the user should match (capital-case sensitive) the file name. For example, to allow the user nopbyte in github to login into the gateway, it is necessary to create a user with the attributes user_name nopbyte and auth_type github (given that there is a file called github.js in the provider folders). 

In the case of users for which the authentication strategy does not check the a password, users *stored in the Agile IDM* do not require to have a password. Such examples include the Oauth2 providers, webid, or even the PAM mechanism. Or to put it differently, the only user registration that exptects the user to have a password is the agile-local authentication provider. This is the case because this strategy compares the username and password provided to the password stored in the database.

In the case of WebID, a user must be created, for which the  user_name matches the profile URI in the certificate, and the auth_type must be webid. In the case of PAM, a user with a user_name matching the username in the operating system and auth_type pam must be created. Please note that, in spite that the pam authentication mechanism requires the password, this password must/should not be stored with the user. The main reason for this is that it is the underlying operating system's responsibility to validate the username and password. AGILE IDM just forwards this information through the PAM interface.


## Bootstrapping

register clients and users with the command line.


## Configuration

For a step by step guide to configure different Oauth2 providers please see: https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/idps-configuration.md

