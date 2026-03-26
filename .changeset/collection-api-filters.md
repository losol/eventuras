---
"@eventuras/api": minor
"@eventuras/event-sdk": minor
---

Add Featured and IncludePastCollections filters to event collections API

- Featured filter to query only featured collections
- IncludePastCollections filter (default false) to hide collections where all events have passed
- Computed dateStart/dateEnd on EventCollectionDto based on contained events
