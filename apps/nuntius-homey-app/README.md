# Nuntius Homey App

Homey app for sending notifications via Domus conductor.

## Status

🚧 Work in progress - coming soon!

## What it does

This Homey app provides Flow cards to easily send notifications through Domus to various channels (Discord, Matrix, WhatsApp, etc.) without having to manually configure HTTP requests.

## Flow Cards

### Actions
- **Send notification** - Send a notification to a configured channel

## Development

This app will be built using the Homey SDK and published to the Homey App Store.

### Local Development

Documentation: <https://apps.developer.homey.app/the-basics/getting-started>

Install Homey CLI:

```bash
npm install --global --no-optional homey
```

### Running the App

#### Development Mode (requires Mac/PC running)

Run the app temporarily for testing:

```bash
homey app run
```

Press `CTRL+C` to stop and uninstall.

#### Install on Homey (persistent)

Install the app permanently on your Homey so it runs even when your Mac/PC is off:

```bash
homey app install
```

To uninstall:

```bash
homey app uninstall
```

To see logs:

```bash
homey app log
```

### Publishing to App Store

When ready to publish:

```bash
homey app publish
```

## Related

- [Domus Conductor](../conductor) - The backend server that handles notifications
