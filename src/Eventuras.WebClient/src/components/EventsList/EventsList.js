import React from 'react'
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";

export default function EventList(props) {
  const { events } = props;

  return (
    <Box px={4}>
      <Heading as="h1" marginTop="16" marginBottom="4">
        Upcoming events...
      </Heading>
      {events && events.map(event => (
        <Box w="100%" my={1} p={4} color="white" key={event.id} borderWidth="1px" borderRadius="lg">
          <Box
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            isTruncated
            color={useColorModeValue("gray.600", "gray.300")}
          >
            {event.name}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
