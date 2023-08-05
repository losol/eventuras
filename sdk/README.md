# Eventuras typescript SDK

1. Update the `swagger.json` file by acccessing `/swagger` in the browser when app is running in development mode.
1. Generate the client `npx openapi-typescript-codegen --input ./swagger.json --output ./typescript --useOptions`
1. `cd typescript`
1. Update version number in package.json
1. `npm login --scope @losol --auth-type web`
1. `npm publish --access public`

## Read more

-   [Npmjs docs on publishing scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)

