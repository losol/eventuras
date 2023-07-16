import { Box, LinkBox, LinkOverlay} from '@chakra-ui/react';
import React from 'react';

import { Link } from '../../common';

function EventCard({ id, title, description, name, href }) {
  return (
    <LinkBox
      href={href}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      background="white"
    >
      <Box p="6">
        <Box
          mt="1"
          fontWeight="semibold"
          fontSize="20px"
          color="black"
          as="h3"
          lineHeight="tight"
          isTruncated
        >
          <LinkOverlay href={href}>
            {title}
            </LinkOverlay>
        </Box>
        <Box color="black">{description}</Box>
      </Box>
    </LinkBox>
  );
}

export default EventCard;
