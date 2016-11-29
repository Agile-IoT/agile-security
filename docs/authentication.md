# User Authentication

AGILE IDM behaves as an Identity Provider for … 
In its current state AGILE IDM offers the following authentication mechanisms:

* Local username and password
* PAM (Pluggable authentication modules) UNIX authentication
* WebID
* Google
* Github

Every user has an id composed of the username and authentication type. During the login process, IDM verifies 
that this particular username and authentication type has been registered. This ensures that only allowed users 
log into the gateway; otherwise, anyone with a Github or Google account would log in.

