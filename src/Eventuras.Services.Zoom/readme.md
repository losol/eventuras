# Zoom Integration

## Installation

1. Create Zoom account, choose Pro pricing plan or higher.
2. Create JWT App in the marketplace https://marketplace.zoom.us/user/build
3. Put configuration into `application.json` or User Secrets:

```
{
    ...
    "Zoom": {
        "Enabled": true,
        "Apps": [
            {
                "Name": "kursinord.no",
                "ApiKey": "...",
                "ApiSecret": "..."
            },
            {
                "Name": "*", // all other hosts
                ...
            },
            ...
        ]
    }
}
```

## Setup

1. In the event UI, add one or multiple Zoom meetings to the event (Sync -> Zoom submenu).
2. Choose Sync with Zoom to export participants to Zoom meeting.
