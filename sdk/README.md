# Eventuras typescript SDK

1. Update the spec file: `eventuras-3-resolved.json`
1. Generate the client `npx openapi-typescript-codegen --input ./eventuras-3-resolved.json --output ./typescript --useOptions`
1. `cd typescript`
1. `npm init --scope @losol`
1. `npm login --scope @losol --auth-type web`
1. `npm publish --access public`

## Read more

-   [Npmjs docs on publishing scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)

