# Eventuras typescript SDK

1. Run the Eventuras API locally
1. Generate the client `npx openapi-typescript-codegen --input http://localhost:5666/swagger/v3/swagger.json --output ./typescript --useOptions`
1. `cd typescript`
1. Update version number in package.json
1. `npm login --scope @losol --auth-type web`
1. `npm publish --access public`

## Read more

-   [Npmjs docs on publishing scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
