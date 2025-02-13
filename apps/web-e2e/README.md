# Overview

Tests are defined in 3 seperate scopes: Admin, User and Anonmous. The first two already are registered and their email adresses need to be defined in the env file. The latter are run with randomly generated usernames each time. Tests are run in serial and therefore require quite some time to finish (over 5 minutes). They do not run in parallel because event registration and editing requires the event to be created first, which are done in the admin tests.

# Creating new tests

Each test flow, in principle, runs in its own file, which is a suite of tests bundled together. The reason these files start with a number is to make sure they are run in that specific order (playwright runs tests in alphabetical order), because event creation needs to happen before registration and product editing done after event registration, etc. When creating a new test decide where it sits in the order and number it accordingly. Any 'admin' ran tests start with admin, same for 'user' and 'anonymous', those for now are the different contexts.

A filename then is build up like this
`{number in order},{admin | user | anonymous}-{testscenario name}.spec.ts`

# Gmail setup for OTP testing

# Setting Up an OAuth Client for Gmail

You can set up an OAuth client for Gmail through the [Google Cloud Console](https://console.cloud.google.com/). Follow these steps:

1. **Create or Select a Google Cloud Project:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.

2. **Enable the Gmail API:**

   - In the Cloud Console, navigate to **APIs & Services > Library**.
   - Search for “Gmail API” and click **Enable**.

3. **Configure the OAuth Consent Screen:**

   - Go to **APIs & Services > OAuth consent screen**.
   - Choose an appropriate User Type (Internal for G Suite/Workspace accounts or External for public users).
   - Fill in the required fields (app name, support email, etc.).  
     _This step is necessary for the OAuth flow, even if you're just using it for testing._

4. **Create OAuth Client Credentials:**

   - Go to **APIs & Services > Credentials**.
   - Click on **Create Credentials > OAuth client ID**.
   - Select the appropriate **Application Type** (e.g., Web application, Desktop app).
   - Provide a name and specify the **Authorized redirect URIs**.  
     For example, if you're using a testing tool like the OAuth 2.0 Playground, you might use its default redirect URI, or set one that your app will use.
   - Click **Create**.
   - A dialog will display your new **Client ID** and **Client Secret**. Copy these for later use.

5. **Store Your Credentials Securely:**
   - Use the Client ID and Client Secret in your application by storing them in environment variables (for example, using [dotenv](https://www.npmjs.com/package/dotenv) or [dotenv-safe](https://www.npmjs.com/package/dotenv-safe)).

For more details, refer to:

- [Gmail API Quickstart for Node.js](https://developers.google.com/gmail/api/quickstart/nodejs)
- [Google Cloud Documentation on Creating OAuth Client IDs](https://cloud.google.com/docs/authentication/getting-started)

This setup will allow your application to perform OAuth2 flows with Gmail, enabling you to obtain access and refresh tokens for API calls.

# Authentication

Playwright stores browser state in the playwright-auth folder. Two browser states are stored - admin and user state. This saves having to relogin between tests, as each test runs independently.

However, if you decide tht the json files in playwright-auth are still valid, you can skip the login between -runs- by running `test:playwright:skiplogin`

# Created event

Every time an event is created, the createdEvent.json gets overwritten(or created if first run). This contains the event id created and is reused in user and anonymous testing to assure a 'fresh' event to work with. This may be replaced in the future if the API supports sorting by creation date. Or if database wiping is supported between test runs.

# To create new test accounts

To create new users for test scripts the below needs to be followed, the exception are tests run as anonymous - as that user registers itself.

## Admin - Create and register the new user

Login to testmail.app.
Create a new tagged email adress. (for instance {testmailaccount identifier}.admin@inbox.testmail.app)
Use this to register on eventuras. Use the json email viewer to view the code (https://testmail.app/console)

## Admin - Add the user to the organization through the Eventuras API

Create a PUT request to the following endpoint:

`{{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}`

Where

- baseUrl = the base url for the API
- organizationId = the org id (should be 1)
- targetUserId = the user that you have created earlier, its id in the system(after registration)

Make sure you have admin right token to send the request!

## Give the user admin rights

Make sure the user has admin rights in auth0 first!
Create a POST request to the following endpoint:

`{{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}/roles`

With the following Body:

`{
  "role":"Admin"
}`

Confirm the role is added by creating a GET request:

`{{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}/roles`

# User - To create a test account (user)

To create a new user account and use it for automated testing, make sure it is registered first(manual process). Once this is done it can be setup in user.auth.setup.ts(it uses the environment variable, which can be changed accordingly).
