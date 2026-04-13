# ADR 0001 — Sender/Receiver Adapter Architecture

## Status

Accepted

## Context

Conductor is a monolithic Express app where plugin definitions, implementations, and routing all live in `src/plugins/`. The `ConductorPlugin` interface couples adapters to hub concerns (tenant IDs, env var indirection), making them unusable outside the hub. Only Discord is implemented.

This needs to change for two reasons:

1. **Adapters are not reusable.** Using the Discord plugin requires the hub's config system, tenant model, and Express server.
2. **Adding channels requires modifying hub internals.** There is no standard contract for what an adapter must provide.

Some transports (MQTT) are also naturally bidirectional. The current interface only models sending.

## Decision

### Package structure

```
libs/conductor-core/       @eventuras/conductor-core    — shared interfaces
libs/conductor-discord/    @eventuras/conductor-discord  — standalone Discord adapter
libs/conductor-mqtt/       @eventuras/conductor-mqtt     — standalone MQTT adapter
apps/conductor/            @eventuras/conductor          — hub (optional orchestrator)
```

Each adapter is a standalone library — import, configure with concrete values, use. No hub required.

### Core interfaces

**Sender** — delivers a message somewhere (Discord, MQTT publish, Twilio, email):

```typescript
interface ConductorSender {
  readonly type: string;
  readonly version: string;
  readonly status: SenderStatus;
  initialize(): Promise<void>;
  send(message: SendMessage): Promise<SendResponse>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

**Receiver** — listens for incoming messages (MQTT subscribe, webhooks). Interface defined now, implemented later:

```typescript
interface ConductorReceiver {
  readonly type: string;
  readonly version: string;
  readonly status: ReceiverStatus;
  initialize(): Promise<void>;
  onMessage(handler: (message: ReceivedMessage) => void | Promise<void>): void;
  shutdown(): Promise<void>;
}
```

Simple callback pattern — supports multiple handlers, async handlers. Event emitter pattern (`.on('error')`, `.on('disconnect')`) can be added later if needed.

**Hub** — optional router that dispatches to registered senders:

```typescript
interface ConductorHub {
  registerSender(sender: ConductorSender): void;
  registerReceiver(receiver: ConductorReceiver): void;
  send(message: HubMessage): Promise<SendResponse>;
  shutdown(): Promise<void>;
}
```

The hub routes via `hub.send({ channel: 'discord', ... })` — it is channel-agnostic. For direct access, use the standalone sender.

### Same package, both directions

A single package (e.g. `conductor-mqtt`) can export both a sender and a receiver. Natural for transports that share connection and config. For asymmetric transports (email: SMTP out, IMAP in), separate packages remain an option.

### Adapters receive resolved config

Adapters accept concrete values (tokens, URLs) — not env var names or secret references. This is what makes them standalone. The hub handles secret resolution before passing config to adapters.

### Per-tenant config with secret references

Hub config uses per-tenant JSON files in `data/config/tenants/`. Non-sensitive values inline, secrets via `{ "$secret": "key" }`:

```json
{
  "name": "Acme Corp",
  "auth": { "apiKey": { "$secret": "acme.apiKey" } },
  "channels": [
    {
      "name": "alerts",
      "adapter": "discord",
      "config": {
        "defaultChannelId": "123456789",
        "botToken": { "$secret": "acme.discord.botToken" }
      }
    }
  ]
}
```

Secret resolution is pluggable — env vars by default, `.secrets.json` for local dev, extensible to Docker/k8s secrets or Vault.

### API authentication

Per-tenant API keys via `$secret` reference for M2M access. Constant-time comparison. Future option: JWT via Authentik (OAuth2 client credentials).

### Config schemas owned by adapters

Each adapter exports a Zod schema describing its config. The hub validates at startup — fail fast, clear errors, adapter-agnostic.

### Explicit registration

Hub explicitly imports and registers adapter factories at startup. No dynamic discovery — TypeScript verifies at compile time.

## Consequences

**Positive:**

- Adapters usable as standalone libraries
- Hub becomes optional
- New channel = new package + one-line registration
- Receiver interface reserved for future inbound sources
- Config files safe to commit (no secrets)

**Considerations:**

- Three packages to maintain (mitigated by monorepo tooling)
- Config migration from single-array JSON + env var names to per-tenant files + `$secret`
- Breaking HTTP API change: `"channel": "discord-bot"` → `"channel": "discord"`

## Implementation Plan

### Phase 1: `libs/conductor-core`

Shared types: `ConductorSender`, `ConductorReceiver`, `ConductorHub`, `SendMessage`, `SendResponse`, `ConductorLogger`, `SenderConfigDescriptor`, error classes.

### Phase 2: `libs/conductor-discord`

Port `src/plugins/discord/` to standalone `DiscordSender` with `createDiscordSender({ config, logger? })`.

### Phase 3: `libs/conductor-mqtt`

New `MqttSender` with `createMqttSender({ config, logger? })`. `targetId` maps to MQTT topic.

### Phase 4: Refactor hub

Replace `src/plugins/` with `src/hub/`. Implement `ConductorHub`, per-tenant JSON config, `$secret` resolution. Replace Express with Fastify ([ADR 0002](0002-fastify-over-express.md)).

### Phase 5: Cleanup

Move `discord.js` to `conductor-discord`, replace Express deps with Fastify, update docs.

## Decision Date

2026-04-13

## Appendix: Design Decisions

Detailed rationale for design choices discussed during planning.

### Terminology

| Term                 | Verdict    | Reason                                                                                       |
| -------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| **sender/receiver**  | **Chosen** | Plain language, immediately understood, reads well in code (`DiscordSender`, `MqttReceiver`) |
| inbound/outbound     | Considered | Clear direction, but more "architect-speak"                                                  |
| ingress/egress       | Rejected   | Kubernetes jargon                                                                            |
| source/sink          | Rejected   | Data engineering jargon                                                                      |
| publisher/subscriber | Rejected   | Too MQTT-specific                                                                            |
| producer/consumer    | Rejected   | Implies a queue between them; conductor is a router                                          |

### Why same package for both directions

Transports like MQTT and Discord share a connection, config (broker URL / bot token), and dependency (`mqtt` / `discord.js`). Splitting into `conductor-mqtt-sender` and `conductor-mqtt-receiver` would mean two packages with identical dependencies connecting to the same broker separately. One package exporting both is the natural design.

For asymmetric transports where send and receive use different protocols (email: SMTP out, IMAP/webhook in), separate packages remain an option.

### Hub routing: `hub.send({ channel })` vs `hub.discord.send()`

Three options were considered:

- **`hub.send({ channel: 'discord', ... })`** — chosen. Hub is a router, it should be channel-agnostic. Channel name comes from tenant config. HTTP API maps 1:1 to the programmatic API.
- **`hub.discord.send(...)`** — rejected. Couples hub API to adapter knowledge. Requires Proxy magic or explicit properties for every adapter type.
- **`hub.getSender('discord').send(...)`** — considered. Reasonable, but adds an extra step. If you want direct sender access, use the standalone package instead of going through the hub.

### Config model: per-tenant files with `$secret`

The previous model used a single `channels.json` array with `providerIdEnvVar`/`providerSecretEnvVar` fields pointing to env var names. Problems: doesn't scale with many tenants, mixing config structure with secret resolution, and adding a tenant means editing a shared array file.

Per-tenant JSON files solve this: new tenant = new file, config is readable, non-sensitive values live inline, and secrets are clearly marked with `{ "$secret": "key" }`. The `$secret` resolution is pluggable:

1. **Env vars** (default): `acme.discord.botToken` → `CONDUCTOR_SECRET_ACME_DISCORD_BOTTOKEN`
2. **Secrets file**: `.secrets.json` (gitignored) with flat key-value mapping for local dev
3. **Future**: Docker/k8s secrets, Vault

### Receiver pattern: callback vs event emitter

Simple callback (`onMessage(handler)`) was chosen over event emitter (`.on('message')`, `.on('error')`, `.on('disconnect')`). Reasons:

- Lower API surface — one method to implement
- Supports multiple handlers and async handlers
- Event emitter adds lifecycle events (error, disconnect, reconnect) that vary per transport — better to let each adapter handle those internally and expose a simple "message arrived" contract
- Event emitter pattern can be added later as an extension if needed

### Usage examples

**Standalone:**

```typescript
const discord = createDiscordSender({
  config: { botToken: 'MTIz...', defaultChannelId: '123456' },
});
await discord.initialize();
await discord.send({ content: 'Server is online', priority: 'normal' });
```

**Hub — programmatic:**

```typescript
const hub = createConductorHub();
hub.registerSender(createDiscordSender({ config: { ... } }));
hub.registerSender(createMqttSender({ config: { ... } }));
await hub.initialize();
await hub.send({ channel: 'discord', content: 'Alert!', priority: 'high' });
```

**Hub — HTTP API:**

```bash
curl -X POST https://conductor.example.com/notifications \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "channel": "discord", "message": "Motion detected", "priority": "high" }'
```
