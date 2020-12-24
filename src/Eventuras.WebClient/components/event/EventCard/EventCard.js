import { Box, useColorMode } from "@chakra-ui/react";

import Link from "next/link";
import React from "react";

function EventCard({ id, title, description }) {
  const { colorMode, toggleColorMode } = useColorMode();
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
          {title}
        </Box>

        <Box>{description}</Box>
        <Link href={`/event/${id}`}>Les mer</Link>
      </Box>
    </Box>
  );
}

export default EventCard;
