import { Badge, Box, Image, StarIcon } from "@chakra-ui/react";

import { react } from "react";

function EventCard() {
  return (
    <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Box p="6">
        <Box
          mt="1"
          fontWeight="semibold"
          as="h2"
          lineHeight="tight"
          isTruncated
        >
          Event Title here
        </Box>

        <Box>Price here</Box>
      </Box>
    </Box>
  );
}

export default EventCard;
