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
