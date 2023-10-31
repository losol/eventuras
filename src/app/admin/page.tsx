'use client';

import useTranslation from 'next-translate/useTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Environment from '@/utils/Environment';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('admin:title')}</Heading>
        <section className="py-10">
          <Link href={`/admin/events/create`} variant="button-primary">
            {t('admin:createEvent.content.title')}
          </Link>
        </section>
        <Heading as="h2">{t('common:events')}</Heading>
        <AdminEventList organizationId={ORGANIZATION_ID} />
      </Container>
    </Layout>
  );
}
