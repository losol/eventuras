import { Badge, Box } from '@chakra-ui/react';
import { EventInfoStatus } from '@losol/eventuras';

const EventStatusBadge = ({ status }: { status: EventInfoStatus }) => {
  const {
    // Default properties
    colorScheme = 'gray',
    variant = 'solid',
    text = status,
  } = badges[status]; // Specific properties

  return (
    <Box textAlign="right">
      <Badge variant={variant} colorScheme={colorScheme} mt={2} mr={2}>
        {text}
      </Badge>
    </Box>
  );
};

type BadgeType = {
  colorScheme?: string;
  variant?: string;
  text?: string;
};

// Specific badge properties. Add only properties different from default (cpecified below in EventStatusBadge)
const badges: { [key in EventInfoStatus]: BadgeType } = {
  [EventInfoStatus.DRAFT]: {
    variant: 'subtle',
  },
  [EventInfoStatus.PLANNED]: {
    colorScheme: 'blue',
    variant: 'subtle',
  },
  [EventInfoStatus.REGISTRATIONS_OPEN]: {
    colorScheme: 'green',
    text: 'Registrations Open',
  },
  [EventInfoStatus.WAITING_LIST]: {
    colorScheme: 'orange',
    text: 'Waiting List',
  },
  [EventInfoStatus.REGISTRATIONS_CLOSED]: {
    colorScheme: 'pink',
    text: 'Registrations Closed',
  },
  [EventInfoStatus.FINISHED]: {
    colorScheme: 'blackAlpha',
    variant: 'subtle',
  },
  [EventInfoStatus.ARCHIVED]: {
    colorScheme: 'blackAlpha',
    variant: 'subtle',
  },
  [EventInfoStatus.CANCELLED]: {
    colorScheme: 'red',
  },
};

export default EventStatusBadge;
