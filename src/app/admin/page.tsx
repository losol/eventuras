'use client';

import { UserDto } from '@losol/eventuras/models/UserDto';
import useTranslation from 'next-translate/useTranslation';

import { Heading } from '@/components/content';
import { Loading } from '@/components/feedback';
import { InputAutoComplete } from '@/components/inputs/Input';
import Link from '@/components/inputs/Link';
import { Container, Layout } from '@/components/layout';
import { useEvents } from '@/hooks/apiHooks';
import { getUsers } from '@/utils/api/functions/users';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
export const dynamic = 'force-dynamic';
const l = { namespace: 'admin' };

export default function AdminPage() {
  const { t } = useTranslation('admin');
  const { t: common } = useTranslation('common');
  const { loading: eventsLoading, events } = useEvents({
    organizationId: ORGANIZATION_ID,
    includeDraftEvents: true,
    includePastEvents: true,
    count: 250,
  });
  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('title')}</Heading>
        <section className="py-10">
          <Link href={`/admin/events/create`} variant="button-primary">
            {t('createEvent.content.title')}
          </Link>
        </section>
        <InputAutoComplete
          id="find_user"
          placeholder="Find user"
          dataProvider={getUsers}
          minimumAmountOfCharacters={3}
          labelProperty="name"
          onItemSelected={(u: UserDto) => {
            Logger.info(l, u);
          }}
        />
        <Heading as="h2">{common('events')}</Heading>
        {eventsLoading ? <Loading /> : <AdminEventList eventinfo={events ?? []} />}
      </Container>
    </Layout>
  );
}
