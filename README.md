# Eventuras front end

This is the front end for Eventuras event management system.

## Getting Started

First, ensure the backend api is running.

If developing locally copy .env-local to .env and fill in the blanks (ask or lookup secrets on auth0).

For production environment these variables should as environment variables.

To start dev serv

```bash
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API swagger documentation

https://api.eventuras.losol.io/swagger/index.html

## API documentation

Check out [api documentation](src/utils/api/README.md)

## Precommit hook

In package.json there is a lint-staged section which shows all the actions taken on staged files.
Unfortunately tsc ignores tsconfig (see why section of https://github.com/gustavopch/tsc-files). So we use tsc-files to do these checks. Unfortunately it generates tsconfig.\*.tsbuildinfo files, but these should be automatically removed.

## Code style

We are open to most standards, as long as there is one. We were inspired by [joshchus setup](https://dev.to/joshchu/how-to-setup-prettier-eslint-husky-and-lint-staged-with-a-nextjs-and-typescript-project-i7b)

## Using utils/api

The pattern is quite straight forward:

```
const result = await getUserProfile();
      if (result.ok) {
        updateUserProfile(result.value);
        updateAuthStatus({ isAuthenticated: true });
      } else {
        setUserState(prevState => ({
          ...prevState,
          error: result.error.message,
        }));
      }
```

Any implementation in api/functions should use the apiFetch provided, which will return standard API results - containing either a value on 'ok' or an error.

The signature of that function looks like this:

```
const getUserProfile = (): Promise<ApiResult<UserDto, ApiError>> => apiFetch(ApiURLs.userprofile);
```
