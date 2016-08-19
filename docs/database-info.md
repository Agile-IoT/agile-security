#Database Info

## Kind of authentication mehtods, i.e. auth_type
* Oauth2:
** google: Oauth2 with Google
** github: Oauth2 with Github
* Local:
** unix_pam: local user authenticated with the PAM modules of the OS (requires pam-dev library)
** fallback_user_no_pam: used when users don't install PAM authentication as a fallback. reads credential from conf/fallback_user_no_pam
