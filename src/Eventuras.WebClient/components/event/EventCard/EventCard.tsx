import { Box } from '@chakra-ui/react';
import React from 'react';

import { Link } from '../../common';

function EventCard({ id, title, description, name, href }) {
  return (
    <Link
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
          {title}
        </Box>
        <Box color="black">{description}</Box>
      </Box>
    </Link>
  );
}

export default EventCard;
