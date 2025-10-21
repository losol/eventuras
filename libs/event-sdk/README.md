## swagger.json adaptions

Note that the `EventFormDtoJsonPatchDocument` object in the swagger.json file to avoid openapi-ts errors.

We need to remove the readonly:true the `swagger.json` to get rid of the errors in the generated code. This is because openapi-ts does not support our readonly properties in the generated types.

Seems to be related to the following work:
https://github.com/hey-api/openapi-ts/pull/1896
