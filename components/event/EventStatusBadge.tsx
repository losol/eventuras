import { Box, Badge } from '@chakra-ui/react';
import { EVENT_STATUS } from 'const';
import { EventStatusType } from 'types';

const EventStatusBadge = ({ status }: { status: EventStatusType }) => {
  const {
    // Default properties
    colorScheme = 'gray',
    variant = 'solid',
    text = status,
  } = badges[status]; // Specific properties

  return (
    <Box textAlign='right'>
      <Badge
        variant={variant}
        colorScheme={colorScheme}
        mt={2}
        mr={2}
      >
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
const badges: { [key in EventStatusType]: BadgeType } = {
  [EVENT_STATUS.DRAFT]: {
    variant: 'subtle',
  },
  [EVENT_STATUS.PLANNED]: {
    colorScheme: 'blue',
    variant: 'subtle',
  },
  [EVENT_STATUS.REGISTRATIONS_OPEN]: {
    colorScheme: 'green',
    text: 'Registrations Open',
  },
  [EVENT_STATUS.WAITING_LIST]: {
    colorScheme: 'orange',
    text: 'Waiting List',
  },
  [EVENT_STATUS.REGISTRATIONS_CLOSED]: {
    colorScheme: 'pink',
    text: 'Registrations Closed',
  },
  [EVENT_STATUS.FINISHED]: {
    colorScheme: 'blackAlpha',
    variant: 'subtle',
  },
  [EVENT_STATUS.ARCHIVED]: {
    colorScheme: 'blackAlpha',
    variant: 'subtle',
  },
  [EVENT_STATUS.CANCELLED]: {
    colorScheme: 'red',
  },
};

export default EventStatusBadge;
