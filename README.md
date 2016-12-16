[![Build Status](https://travis-ci.org/Agile-IoT/agile-IDM.svg?branch=master)](https://travis-ci.org/Agile-IoT/agile-IDM)

# AGILE Identity Management (a.k.a AGILE-IDM Web)

The main functionalities of AGILE IDM are the following:

* **Oauth2 provider**: AGILE IDM implementa the authorization code grant of Oauth2. In turn, AGILE IDM can still use external identity providers such as google, github, or even the local operating system to authenticate users, depending on its configuration. This allows the AGILE framework and potentially other applications to rely on it to handle the authentication of their users.
* **User registration**:: AGILE IDM also handles the user regitration and management. In this way only certain users are allowed to login in the gateway. This is of utmost importance when AGILE IDM relies on external identity providers, because otherwise any user with a valid account in the external identity provider would be able to log in.
* **Entity registration**: AGILE IDM is used to register entities, such as sensors, oauth2 clients, workflows, etc. This forms the basis for policy enforcement.
* **Entites' attributes management**: AGILE IDM allows users to manage their entitie's attributes. It implements write and read policies on the data to provide attribute asurance, which then allows for the implementation of a wide range of access control mechanisms, such as role based access control among others.
* **Entity lookup**:  AGILE IDM allows users to lookup entities. To this end, users can provide a set of constraints specifying attribute name and value.
* **Entity attribute declasification**: AGILE IDM also declasifies attributes that are not readable by users that query IDM. For example, there may be certain attributes that can only be read by the entity owner, but not by the rest of the users. 
* **Credential Management**: Thanks to the entity declasification functionality of AGILE IDM, it could configured to allow entities to store credentials (that are used to connect to external clouds or systems for example). Provided that the right policies are configured, IDM would only return this information to the entities allowed to read this information, e.g. the owner of the entity.
* **Group Management**: To simplify the policy definition for developers, users can define groups and add entities to them. This can provide an easy way to handle entities and to define security policies for them by referencing the group directly.

## Setting up a Running Example


AGILE IDM offers an oauth2 server which in turn can rely on third party Identity Providers (IdPs) to authenticate users in AGILE.
Currently, AGILE IDM supports the authorization code flow of Oauth2. As a result, every application acting as an Oauth2 client (using AGILE IDM as identity provider), must be first registered with AGILE IDM. To have a quick set-up running with a registered Oauth2 client please check the oauht client example referenced below.

Given that a client is required, we provide two examples that can be used to build upon and get started using AGILE IDM. 
To get a minimalistic example running with IDM, it is required to clone the "client" branch of the oauth2-example of idm located here (https://github.com/Agile-IoT/agile-idm-oauth2-client-example).

Another option is to not only use AGILE IDM as an identity provider, but also to use its capabilities to manage and register entities. For developers interested in this, the "api-client" branch of the oauth2-example contains an express web application, with a demo graphical user interface, that executes the REST calls to the REST Entity API when the user uses the browser to do basic operations on identities, such as reading, creation of entities, updating attributes, etc.

## Debug mode

If you define the following variable (to be 1) this module will print debugging information to stdout, and in case of exceptions, it will print the stack trace in the browser. 

export DEBUG_IDM_WEB=1

If no variable is set, or if any other value different than 1 is set, this component runs in quiet mode.

To debug the agile-idm-core or the agile-idm-storage components that are within agile-idm-web-ui please set the environment variables DEBUG_IDM_CORE  or DEBUG_IDM_STORAGE to 1 respectively. These two components will log to stdout debugging information.

## Additional Documentation

[Architecture](https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/architecture.md)

[User Authentication](https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/authentication.md)

[Identity Model] (https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/identity-model.md)

[Configuration of Identity Providers (such as google, github, pam authentication, etc)](https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/idps-configuration.md)

## Main open source projects used by AGILE IDM

Although AGILE IDM has more dependencies, the key open source components used are the following:

* **Express**: This framework is used as the basis for building the AGILE IDM web server. Along with express several middlewares were used to cope with body parsing, sesion handling, etc.
* **Passport**: Passport is an authentication framework with a live ecosystem of pluggins contributed by the open source community. It has been used to implement the athentication mechanisms used by AGILE IDM.
* **Oauth2-orize**: This framework uses passport to facilitate the construction of an Oauth2 server.
* **LevelDB**: LevelDB provides a lightweight key value database used by AGILE IDM and its submodules to store tokens, antities and groups.
* **UPFROnt**: the ULock Policy FRamewOrk (UPFRont) is used to support usage locks to apply enforcement to write and read actions on attributes.
