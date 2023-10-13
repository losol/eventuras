# Setting up Sentry error tracking

## Overview

This guide provides administrators with step-by-step instructions to enable Sentry error tracking. Sentry provides real-time error tracking. When an error occurs, Sentry captures the error and sends it to the Sentry dashboard. This allows administrators to monitor errors and troubleshoot issues.

## Table of Contents

-   [Overview](#overview)
-   [Prerequisites](#prerequisites)
-   [Configuration Steps](#configuration-steps)
-   [Setting Via Environment Variables](#setting-via-environment-variables)
-   [Validation](#validation)
-   [Troubleshooting](#troubleshooting)

## Prerequisites

-   An account with Sentry (if you don't have one, you can sign up [here](https://sentry.io/signup/))

## Configuration Steps

### Using `appsettings.json`

1. **Obtain the Sentry DSN**: Log into your Sentry account, navigate to your project, and find the Data Source Name (DSN) under the "Project Settings" menu.

2. **Open `appsettings.json`** in the `/src/Eventuras.WebApi/`folder` and enable Sentry under FeatureManagement.

    ```json
    {
        "FeatureManagement": {
            "UseSentry": true
            // other feature flags here
        }
    }
    ```

3. **Add Sentry DSN**: Locate the `Sentry` section and add the DSN:

    ```json
    {
        "Sentry": {
            "Dsn": "your-sentry-dsn-here"
        }
    }
    ```

4. **Save and Restart**: Save changes to the `appsettings.json` file and restart the application for changes to take effect.

### Setting Via Environment Variables

Alternatively, you can use environment variables to override settings in the `appsettings.json` file:

-   To enable Sentry: Set an environment variable named `FeatureManagement__UseSentry` to `true`.

-   To add Sentry DSN: Set an environment variable named `Sentry__Dsn` to your Sentry DSN.

These variables will take precedence over values in the `appsettings.json` file.

## Validation

To confirm that Sentry is correctly configured:

1. Trigger an error in the application.
2. Log into Sentry and check that the error appears in the dashboard.

## Troubleshooting

-   Make sure that `appsettings.json` is saved in the correct directory and has the proper permissions.
-   Validate that your Sentry DSN is correct.
-   Confirm that the application has been restarted after configuration changes.

