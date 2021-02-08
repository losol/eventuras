# Eventuras API V3 Open API Schema

## Using generator script (Linux)

```
./gendocs.sh -o ../docs/openapi/v3 v3/eventuras-api.v3.yaml
```

OR alternatively to use other HTML format for the generated docs:

```
./gendocs.sh -o ../docs/openapi/v3 -a v3/eventuras-api.v3.yaml
```

## Generating code manually

### Installing OpenAPI generator

Follow instructions on the [OpenAPI Generator page](https://github.com/OpenAPITools/openapi-generator).

### Generate HTML spec

```
openapi-generator generate -i eventuras-api.v3.yaml -g html -o build/html --global-property skipFormModel=true
```

Alternatively, another HTML format may be used:

```
openapi-generator generate -i eventuras-api.v3.yaml -g html2 -o build/html2 --global-property skipFormModel=true
```

### Generate single YAML spec

```
openapi-generator generate -i eventuras-api.v3.yaml -g openapi-yaml -o build/openapi -p outputFile=eventuras-api.v3.yaml
```

### Generate single JSON spec
 
```
openapi-generator generate -i eventuras-api.v3.yaml -g openapi -o build/openapi -p outputFile=eventuras-api.v3.json
```

## TODO

 - Event management API
 - External event API
 - Event collections API
 - User management API
 - Order management API
 - Product management API
 - ?

## Links

 - [Open API generator tool](https://github.com/OpenAPITools/openapi-generator)
