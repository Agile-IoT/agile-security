[![Build Status](https://travis-ci.org/Agile-IoT/agile-IDM.svg?branch=master)](https://travis-ci.org/Agile-IoT/agile-IDM)

# AGILE Identity Management (a.k.a AGILE-IDM Web)

This component offers an oauth2 server which in turn can rely on third party Identity Providers (IdPs) to authenticate users in AGILE.
Currently, AGILE IDM supports the authorization code flow of Oauth2.
As a result, every application acting as a relying party (using AGILE IDM as identity provider), must be first registered with AGILE IDM. For more information please see the user authentication chapter (https://github.com/Agile-IoT/agile-idm-web-ui/blob/master/docs/authentication.md).

Given that AGILE IDM behaves as an Oauth2 provider (for authorization code grants), we will cover two topics to introduce how user authentication works. Fist of all, we clarify how the authorization grant, and sencond.

## Setting up a Running Example

Given that a client is required, we provide two examples that can be used to build upon and get started using AGILE IDM. 
To get a minimalistic example running with IDM, it is required to clone the "client" branch of the oauth2-example of idm located here (https://github.com/Agile-IoT/agile-idm-oauth2-client-example).

Another option is to not only use AGILE IDM as an identity provider, but also to use its capabilities to manage and register entities. For developers interested in this, the "api-client" branch of the oauth2-example contains an express web application, with a demo graphical user interface, that executes the REST calls to the REST Entity API when the user uses the browser to do basic operations on identities, such as reading, creation of entities, updating attributes, etc.

## Debug mode

If you define the following variable (to be 1) this module will print debugging information to stdout, and in case of exceptions, it will print the stack trace in the browser. 

export DEBUG_IDM_WEB=1

If no variable is set, or if any other value different than 1 is set, this component runs in quiet mode.

To debug the agile-idm-core or the agile-idm-storage components that are within agile-idm-web-ui please set the environment variables DEBUG_IDM_CORE  or DEBUG_IDM_STORAGE to 1 respectively.
