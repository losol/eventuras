import Head from 'next/head';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { EventCard, Layout, Loading, OnlineCourseCard } from 'components';
import { EventPreviewType, LocalesType, OnlineCoursePreviewType } from 'types';

type IndexProps = {
  events: EventPreviewType[];
  onlinecourses: OnlineCoursePreviewType[];
  locales: LocalesType;
};

export default function Index(props: IndexProps) {
  const { events, onlinecourses, locales } = props;
  const { demoTitleLocale, demoTextLocale } = locales.component;
  const { eventsTitle, onlineCoursesTitle } = locales.common;
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>Eventuras</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main>
          <Box margin="8">
            <Heading as="h2" marginTop="16" marginBottom="4">
              {demoTitleLocale} {locale?.toUpperCase()}
            </Heading>
            <Text>{demoTextLocale}</Text>
          </Box>

          <Box margin="8">
            {!events && <Loading />}
            {
              events.length !== 0 &&
              <>
                <Heading as="h2" marginTop="16" marginBottom="4">
                  {eventsTitle}
                </Heading>
                <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing='5'>
                  {events &&
                    events.map((event: EventPreviewType) => (
                      <EventCard
                        key={event.id}
                        event={event}
                      />
                    ))}
                </SimpleGrid>
              </>
            }

            {!onlinecourses && <Loading />}
            {
              onlinecourses.length !== 0 &&
              <>
                <Heading as="h2" marginTop="16" marginBottom="4">
                  {onlineCoursesTitle}
                </Heading>
                <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
                  {onlinecourses &&
                    onlinecourses.map((onlineCourse: OnlineCoursePreviewType) => (
                      <OnlineCourseCard
                        key={onlineCourse.id}
                        onlineCourse={onlineCourse}
                      />
                    ))}
                </SimpleGrid>
              </>
            }
          </Box>
        </main>
      </Layout >
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  // Data
  const eventsResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events'
  );
  const events = await eventsResponse.json();

  const onlinecoursesResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/onlinecourses'
  );
  const onlinecourses = await onlinecoursesResponse.json();

  // Locales
  const translateComponent = await getT(locale, 'index');
  const demoTitleLocale = translateComponent('demoTitle');
  const demoTextLocale = translateComponent('demoText');

  const translateCommon = await getT(locale, 'common');
  const eventsTitle = translateCommon('events');
  const onlineCoursesTitle = translateCommon('onlinecourses');

  return {
    props: {
      events: events.data,
      onlinecourses,
      locales: {
        component: {
          demoTitleLocale,
          demoTextLocale,
        },
        common: {
          eventsTitle,
          onlineCoursesTitle,
        },
      },
    },
    revalidate: 1, // In seconds
  };
};
