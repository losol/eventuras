/*
Update some missing values (such as token) below

Make sure the the url to update to is set correctly, to avoid pushing to production accidentally!
Then run `npx ts-node ./src/utils/automation/event-importer/importer.ts`

!!!! Warning - currently uploading an event works, but afterwards, since slug must be unique a 409 is thrown.
This makes it impossible to fix already uploaded items unless we know the actual event id. For dev this is not such
an issue, as we can just nuke all events before continuing. For production it becomes a little more important

*/

import { EventDto, EventFormDto } from '@losol/eventuras';
import { NodeHtmlMarkdown } from 'node-html-markdown';

import { apiFetch } from '@/utils/api';
import Logger from '@/utils/Logger';

/* all markdown fields of event which should be converted */
const MarkdownFields = {
  description: '',
  practicalInformation: '',
  moreInformation: '',
  welcomeLetter: '',
};
const organizationId = 1;
/*
  Manually put access token here
*/
const accessToken = null;
if (!accessToken) throw new Error('No AccessToken');
const convertMarkdown = (event: EventDto): EventFormDto => {
  Object.keys(MarkdownFields).forEach((markdownField: string) => {
    const key = markdownField as keyof typeof MarkdownFields;
    const markdown = event[key] as string;
    if (markdown && markdown?.length) {
      event[key] = NodeHtmlMarkdown.translate(markdown);
    }
  });
  delete event.id;
  return event as EventFormDto;
};

const postOrPutUpdate = async (updatedEvent: EventFormDto, eventId?: string) => {
  /*
    Where to upload updated events to
  */
  let baseUrl = 'https://api.eventuras.losol.io/v3/events';
  let method = 'POST';
  if (eventId) {
    baseUrl = `${baseUrl}/${eventId}`;
    method = 'PUT';
  }
  return await fetch(baseUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json', //default to json
      'Eventuras-Org-Id': organizationId.toString(),
    },
    method,
    body: JSON.stringify(updatedEvent),
  }).then(async r => {
    let res = null;
    try {
      res = await r.json();
    } catch {}
    try {
      res = await r.text();
    } catch {}
    return res || r;
  });
};

const importConvertEventsFromProductionToDev = async () => {
  /**
   * If more pages are available, manually change this url (page=2,page=3 etc)
   */
  const productionEventEndpoint =
    'https://api.legekurs.no/v3/events?includePastEvents=true&page=1&count=1';
  const result = await apiFetch(productionEventEndpoint);
  if (result.ok) {
    const events: EventDto[] = result.value.data;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const updatedEvent = convertMarkdown(event);
      updatedEvent.organizationId = organizationId;
      const result = await postOrPutUpdate(updatedEvent);

      Logger.info({ namespace: 'importer' }, updatedEvent.slug, result.status, result.statusText);
    }
  }
};

importConvertEventsFromProductionToDev();
