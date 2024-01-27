# Overview

Tests are defined in 3 seperate scopes: Admin, User and Anonmous. The first two already are registered and their email adresses need to be defined in the env file. The latter are run with randomly generated usernames each time. Tests are run in serial and therefore require quite some time to finish (over 5 minutes). They do not run in parallel because event registration and editing requires the event to be created first, which are done in the admin tests.

# Creating new tests

Each test flow, in principle, runs in its own file, which is a suite of tests bundled together. The reason these files start with a number is to make sure they are run in that specific order (playwright runs tests in alphabetical order), because event creation needs to happen before registration and product editing done after event registration, etc. When creating a new test decide where it sits in the order and number it accordingly. Any 'admin' ran tests start with admin, same for 'user' and 'anonymous', those for now are the different contexts.

A filename then is build up like this
`{number in order},{admin | user | anonymous}-{testscenario name}.spec.ts`

# OTP fetching

Testmail.app is used through their API to fetch one time codes for admin and user login and for the anonymous user to register. The api key in use could be a free one - in that case there is a limit of 100 emails per month.

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
