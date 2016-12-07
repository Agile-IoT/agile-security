[![Build Status](https://travis-ci.org/Agile-IoT/agile-IDM.svg?branch=master)](https://travis-ci.org/Agile-IoT/agile-IDM)

# AGILE Identity Management (a.k.a AGILE-IDM Web)

This component offers an oauth2 server which in turn can rely on third party Identity Providers (IdPs) to authenticate users in AGILE.
Currently, AGILE IDM supports the authorization code flow of Oauth2.
As a result, every application acting as a relying party (using AGILE IDM as identity provider), must be first registered with AGILE IDM. For more information please see the user authentication chapter (https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/authentication.md)


## Authorization Code and Access Token Flow

Assuming that an oauth client has been registered in AGILE IDM, the flow to obtain an access token for any AGILE user is depicted in the following picture:
<table align="center">
	<tr>
		<td><img src="images/idm-architecture.jpg" /></td>
	</tr>
	<tr align="center">
		<td>
			AGILE IDM interaction with Oauth2 clients
		</td>
	</tr>
</table>
