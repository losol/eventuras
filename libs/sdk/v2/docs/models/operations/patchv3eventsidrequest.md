# PatchV3EventsIdRequest

## Example Usage

```typescript
import { PatchV3EventsIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PatchV3EventsIdRequest = {
  id: 264555,
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id`                                                                                                 | *number*                                                                                             | :heavy_check_mark:                                                                                   | The ID of the event to update.                                                                       |
| `eventurasOrgId`                                                                                     | *number*                                                                                             | :heavy_minus_sign:                                                                                   | Optional organization Id. Will be required in API version 4.                                         |
| `eventFormDtoJsonPatchDocument`                                                                      | [components.EventFormDtoJsonPatchDocument](../../models/components/eventformdtojsonpatchdocument.md) | :heavy_minus_sign:                                                                                   | The JSON Patch document with updates.                                                                |