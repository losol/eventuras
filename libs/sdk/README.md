# Deprecated

This SDK is deprecated and frozen, anything inside should no longer be updated(including swagger.json). If any API shape changes occur which is no longer compatible then those should be implemented using the new client sdk, lib/enrollments-sdk.

# Customize swagger json
To customize the url (it defaults to localhost) create a .env file with the following:

SWAGGER_URL=https://api.eventuras.losol.io/swagger/v3/swagger.json

For instance.

# Eventuras typescript SDK

1. Run the Eventuras API locally
1. Update the swagger definition in `npm run update:swagger`
1. Update version number in package.json: `npm version minor` or `npm version patch`
1. Generate the client `npm run generate`
1. Build it `npm run build`
1. `npm login --scope @losol --auth-type web`
1. `npm publish --access public`

## Read more

- [OpenAPI typescript codegen docs](https://github.com/ferdikoomen/openapi-typescript-codegen/tree/master/docs)
- [Npmjs docs on publishing scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
