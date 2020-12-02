# Freetext documentation
## Installation
### Needed Software
The basic needs are:
- python > 3.6 (should be no problem, e.g. I use Win10 WSL and Ubuntu on other machine)
- pip (python package managerm should be already be installed together with python)

### Upgrade
If you upgradem you may need to re-execute ` pip3 install -r requirements.txt`,
as new python3 dependencies may got added.

### Installation steps
1) Install python packages
The needed python packages are listed in ` requirements.txt`,
you can install it via ` pip3 install -r requirements.txt`.

2) Create empty/inital local database (sqlite, no dedicated server needed for local install).
` python3 manage.py migrate`

3) Optional: Create Dummy users and a admin user:
` python3 manage.py createDummyUser`
creates 
 - admin@localhost.local/admin (email = admin@localhost.local)
 - user1@localhost.local/user1 (email = user1@localhost.local)
 - user2@localhost.local/user2 (email = user2@localhost.local)
 - user3@localhost.local/user3 (email = user3@localhost.local)

4) Optional: Fill database with demo data: Create Dummy particioants with users as owner and None as owner
` python3 manage.py createDummyParticipants`

5) Start the backend:
` python3 manage.py runserver`

6) Now you can surf to the API with your webbrowser, it renders html pages,
if the useragent is a browser. If you interact via e.g. javascript,
it behaves as normal JSON based REST API with no html rendering.
See next section for urls.

## Sample urls
- http://127.0.0.1:8000/api/v1/participants/1/ Get specific participant (if allowed)
- http://127.0.0.1:8000/api/v1/participants Get all (allowed) participants
- http://127.0.0.1:8000/api/v1/groups/1/ Get specific group (if allowed)
- http://127.0.0.1:8000/api/v1/groups Get all (allowed) groups

## API Documentation
- http://127.0.0.1:8000/api/v1/openapi Machine readably API documentationdocumentation
- http://127.0.0.1:8000/api/v1/redoc  Rendered and browsable API

## For local admin debug
- http://127.0.0.1:8000/admin Admin Login and Page, you can also create/delete/update here
- http://127.0.0.1:8000/api-auth/login/ User Login via Username and PW

## Tests
I implemented simple testcases. You can run them via ` python3 manage.py backend.tests`

## Registration
You can register a new user via
- http://127.0.0.1:8000/api/v1/user/register/
You need to POST a json payload with
`{"email": "user-mail", "password": "user-password"}`

Emails need to be verify via a GET request to
- http://127.0.0.1:8000/api/v1/user/verify/<token>

## Authentication
Currently the authentication is the standard django and session/cookie based authentication
and additionally jwt token based.
- http://127.0.0.1:8000/api/v1/user/login
You need to POST a json payload with
`{"username": "mail", "password": "user-password"}`

The response will contain `refresh` and `auth` token.
You can ignore the `refresh` token.

## Test login
### Get token
`curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "user1"}' \
  http://localhost:8000/api/v1/user/login`

### Request API Endpoint with token
`curl \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTk4Mzc4NjUxLCJqdGkiOiJmMGFmZmVmOTE0ZjQ0OTA2OWMyMDE5YThmNTk0ZjU4OCIsInVzZXJfaWQiOjZ9.NShfVnadurXjIQjidTmAOto_7YWcEq7ogugtwU0-2b8" \
  http://localhost:8000/api/v1/participants`

## Code Overview
### Core Implementation
 - `backend/campsignup/settings.py`: Settings of the backend.
 - `backend/campsignup/urls.py`: URLs/API endpoints of the backend.
 - `backend/backend/models.py`: Definition of the database fields
 and field permissions.
 - `backend/backend/serializer.py`: Logic of the Database <--> JSON conversion (both directions)
 - `backend/backend/views.py`: The HTTP endpoints

 ### Additional Implementation/Code
 - `backend/management/commands/*.py`: The backend can also be controlled via command line (`python3 manage.py COMMAND`).
 Custom commands are implemented as dedicated python files in this directory.
 - `backend/modules/GenericSerializer.py`: Here is most of the custom serializer code, which is shared between the different API endpoints.
 - `backend/modules/OwnerAPIView.py`: Here is most of the custom HTTP endpoint view code, which is shared between the different API endpoints.
 - `backend/tests/*.py`: The test cases are located here.

## Settings for deployment
The backend installs itself by default as a debug release.
If you want to change it to "production" you need to set environmental variables to override the DEBUG values located in `backend/campsignup/settings.py`:

- `DJANGO_SECRET_KEY`:
  This is a value which is used e.g. as salt for different cryptographic operations in the backend (e.g. password storage hash salt). For production generate a dedicated one:
  `python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
- `DJANGO_HASHID_FIELD_SALT`:
  Pretty similar to above, but explicitly for the hash ids
  (group id obfuscation). As this hash is somehow secure but not 100% secure (which is ok for the group ID), we use a dedicated salt to not endager the global salt.
- `DJANGO_DEBUG_OFF`: Just set this to some value.
  This disables django related debug stuff (e.g. very verbose error messages with maybe critical information).
  It also
    - enforces "more secure" passwords, which is off in debug mode.
    - disables the browsable backend API
    - disables the global CORS whitelist
- `DJANGO_SQL_USR`: PostgreSQL Username
- `DJANGO_SQL_PW`: PostgreSQL Password
- `DJANGO_SQL_HOST`: PostgreSQL Database Host
- `DJANGO_SQL_PORT`: PostgreSQL Database Port
- `DJANGO_SQL_DB`: PostgreSQL Database Name
   If all `DJANGO_SQL_XXX` variables are set, the backend will use PostgreQSL. As soon as one variable is missing it falls back to SqLite.
- `EMAILVERIFICATION_BASEURL`: The base URL where the mail verification link shall point to.
   In debug mode it is `http://localhost:8000/api/v1/user/verify`,
   which will generate links in the form of `https://localhost:4000/api/v1/user/verify/<mail>/<token>`

# Code documentation
(filled out by Redoc (https://github.com/Redocly/redoc) via the OpenAPI information which our backend provides)