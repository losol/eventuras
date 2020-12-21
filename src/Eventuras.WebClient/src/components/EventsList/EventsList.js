import React from 'react'
import { Box } from "@chakra-ui/react";

export default function EventList(props) {
  const { events } = props;

  return (
    <Box px={4}>
      {events && events.map(event => (
        <Box w="100%" my={1} p={4} color="white" key={event.id} borderWidth="1px" borderRadius="lg">
          <Box
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            isTruncated
            color="black"
          >
            {event.name}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
