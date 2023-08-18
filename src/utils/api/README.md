# Eventuras API package

The API follows different routes depending on whether it needs to be a static build, authentication injected, or otherwise.
There's access to the eventuras API through the forwarder, or directly.


## Forwarder
Any fetch that goes through `.../api/eventuras/v3` goes through `app/api/eventuras` (as defined in `NEXT_PUBLIC_API_BASE_URL`)which contains a forwarder redirecting to the external(actual) API, but injects the bearer token first, which is not accesible through the frontend directly.

For unsecured calls, the SDK (such as EventsService) can be called directly, this will required OpenApi.BASE to be set to the actual API(as defined in an evironment variable `API_BASE_URL`)

## Static API calls
Any API calls that require to be called during build time cannot go through the forwarder as the internal API is not running at that point! These are therefore done through the SDK, which goes to the API directly.

## When to use what?
If your API endpoint needs a bearer token, you need to go through the forwarder. For this call a helper function in api/functions, or create one there if it does not exist yet, look at the samples there to see how it works.

## TODO/Issues
Ideally `api/functions` would not need to exist at all, as `OpenAPI.BASE` should just be set to the 'internal' API url, unfortunately there are issues which are not solved yet which causes SDK calls to never resolve when making calls client-side.