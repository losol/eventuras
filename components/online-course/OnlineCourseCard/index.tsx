import { Card, CardBody, CardHeader, Heading, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

const OnlineCourseCard = ({ onlineCourse }: { onlineCourse: any }) => {
  const { name, description } = onlineCourse;

  return (
    <Card
      as={NextLink}
      href={`/online-courses/${onlineCourse.id}`} // TODO: Test slug work after create Online Course Detail Page
    >
      <CardHeader>
        <Heading as="h3">{name}</Heading>
      </CardHeader>
      <CardBody>
        <Text>{description}</Text>
      </CardBody>
    </Card>
  );
};

export default OnlineCourseCard;
