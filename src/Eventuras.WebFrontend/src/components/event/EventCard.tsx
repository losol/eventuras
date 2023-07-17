import { Box, LinkBox } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';

type EventCardProps = {
  title: string;
  description: string;
  href: string;
};

const EventCard = (props: EventCardProps) => {
  const { title, description, href } = props;

  return (
    <LinkBox
      href={href}
      as={NextLink}
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
    </LinkBox>
  );
};

export default EventCard;
