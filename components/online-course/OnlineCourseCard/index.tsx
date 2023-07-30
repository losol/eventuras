import NextLink from 'next/link';
import { Text, Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { OnlineCoursePreviewType } from 'types';

const OnlineCourseCard = ({ onlineCourse }: { onlineCourse: OnlineCoursePreviewType }) => {
  const {
    name,
    description,
    // featured,
    // onDemand,
    slug,
  } = onlineCourse;

  return (
    <Card
      as={NextLink}
      href={`/online-courses/${slug}`} // TODO: Test slug work after create Online Course Detail Page
    >
      <CardHeader>
        <Heading as='h3'>
          {name}
        </Heading>
      </CardHeader>
      <CardBody>
        <Text>
          {description}
        </Text>
      </CardBody>
    </Card >
  );
};

export default OnlineCourseCard;
