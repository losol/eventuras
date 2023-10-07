'use client';

import { UserDto } from '@losol/eventuras/models/UserDto';
import useTranslation from 'next-translate/useTranslation';

import { InputAutoComplete } from '@/components/forms/Input';
import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import { getUsers } from '@/utils/api/functions/users';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
const l = { namespace: 'admin' };

export default function AdminPage() {
  const { t } = useTranslation('admin');
  const { t: common } = useTranslation('common');

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
        <AdminEventList organizationId={ORGANIZATION_ID} />
      </Container>
    </Layout>
  );
}
