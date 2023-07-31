import { memo, useMemo } from 'react';
import NextLink from 'next/link';
import {
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  CardFooter,
  Box,
  Badge,
  Button,
  Flex,
} from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';
import { EventStatusBadge } from 'components';
import { EventDto } from '@losol/eventuras';

const EventCard = memo(function EventCard({ event }: { event: EventDto }) {
  const {
    id,
    category,
    city,
    dateEnd,
    dateStart,
    description,
    featured,
    location,
    // slug,
    status,
    title,
    type,
  } = event;

  const metas = useMemo(
    () => [type, category].filter(meta => meta !== null),
    [type, category]
  );
  /**
 * TODO
 * handle:
 *  <CalendarIcon mr="2" />
          {//{dateStart} - {dateEnd} }
    (datestart is not compatible right now)
 */
  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="center">
        {featured && (
          <Badge colorScheme="orange" mt={2} ml={2}>
            Featured
          </Badge>
        )}
        <EventStatusBadge status={status!} />
      </Flex>
      <CardHeader pb="0">
        <NextLink href={`/events/${id}`}>
          <Heading as="h3" size="lg" mb="2" noOfLines={2}>
            {title}
          </Heading>
        </NextLink>
        <Text
          fontSize="sm"
          mb="1"
          color="blackAlpha.800"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          <CalendarIcon mr="2" />
        </Text>
        <Text fontSize="sm" mb="1" color="blackAlpha.600" fontWeight="bold">
          {city && city + ', '}
          {location}
        </Text>
      </CardHeader>
      <CardBody>
        <Text mb="3" noOfLines={3}>
          {description}
        </Text>
        {metas.length !== 0 && (
          <Text
            fontSize="sm"
            mb="1"
            color="blackAlpha.600"
            display="flex"
            alignItems="baseline"
          >
            {metas.map((meta, index) => {
              const isNotLast = index !== metas.length - 1;
              // TODO: After create event page. Tink. Maybe, extract it into separate component
              return (
                <Box mr={2} as="span" key={index}>
                  {meta}
                  {isNotLast && '•'}
                </Box>
              );
            })}
          </Text>
        )}
      </CardBody>
      <CardFooter display="block" pt="0">
        <Button
          as={NextLink}
          href={`/events/${id}`}
          colorScheme="gray"
          width="full"
        >
          Vis kurset &raquo;
        </Button>
      </CardFooter>
    </Card>
  );
});

export default EventCard;
