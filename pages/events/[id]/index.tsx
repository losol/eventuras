/* eslint-disable */

import { EventDto, EventsService } from '@losol/eventuras';
import { Button } from 'components/inputs';
import { Layout } from 'components/layout';
import { Heading, Image } from 'components/content';
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

//TODO figure out if moreInformation can't be part of EventDto from the onset
type EventProps = EventDto & { moreInformation: any };
const EventInfo = (props: EventProps) => {
  const router = useRouter();
  const { title = '...', description = '...' } = props;
  const { t } = useTranslation();

  return (
    <Layout>
      <Heading>{title}</Heading>
      {props.featuredImageUrl && (
        <Image
          src={props.featuredImageUrl}
          alt=""
          width={600}
          height={400}
          caption={props.featuredImageCaption}
        />
      )}
      {description}
      <div>
        <Button onClick={() => router.push(`${props.id}/register`)}>Register for event</Button>
      </div>
      {props.moreInformation && (
        <>
          <Heading as="h2">{t('More information')}</Heading>
          {parse(props.moreInformation)}
        </>
      )}
      {props.program && (
        <>
          <Heading as="h2">{t('Program')}</Heading>
          {parse(props.program)}
        </>
      )}
      {props.practicalInformation && (
        <>
          <Heading as="h2">{t('Practical Information')}</Heading>
          {parse(props.practicalInformation)}
        </>
      )}
    </Layout>
  );
};

export const getStaticProps = async ({ params }: { params: any }) => {
  const event = await EventsService.getV3Events1({ id: params.id }).catch(() => {
    return { props: null };
  });
  return { props: { ...event } };
};

export async function getStaticPaths() {
  const defaultPath = { paths: [], fallback: false };
  const { data: onlineEvents } = await EventsService.getV3Events({}).catch(() => {
    return { data: null };
  });
  if (!onlineEvents?.length) {
    return defaultPath;
  }
  const paths = onlineEvents.map(event => ({
    params: {
      id: event.id!.toString(),
    },
  }));

  return { paths, fallback: false };
}

export default EventInfo;
