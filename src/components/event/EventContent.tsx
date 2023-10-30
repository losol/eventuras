import { EventDto } from '@losol/eventuras';
import { compiler } from 'markdown-to-jsx';

import Heading from '../ui/Heading';

export type EventContentProps = {
  event?: EventDto | null;
  contentField: keyof EventDto;
  heading?: string;
};
const EventContent = ({ event, contentField, heading }: EventContentProps) => {
  if (!event) return null;
  if (!event[contentField]) return null;
  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      {event[contentField] ? compiler(event[contentField]?.toString() ?? '') : null}
    </>
  );
};

export default EventContent;
