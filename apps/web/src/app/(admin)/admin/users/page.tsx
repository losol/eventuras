import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import FatalError from '@/components/FatalError';

import { getUsers } from './actions';
import UserList from './UserList';
import UsersActionMenu from './UsersActionMenu';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminUserPage({ searchParams }: Readonly<PageProps>) {
  const t = await getTranslations();
  const params = await searchParams;
  const parsedPage = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const pageSize = 50;
  const query = params.q?.trim() || undefined;
  const response = await getUsers(page, pageSize, query);

  if (!response.ok || !response.data) {
    return (
      <Section className="py-8">
        <Container>
          <Heading as="h1">{t('admin.users.page.title')}</Heading>
          <FatalError
            title="Failed to load users"
            description={response.error || 'Unknown error'}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Container>
      <Heading as="h1">{t('admin.users.page.title')}</Heading>
      <UsersActionMenu />
      <UserList
        users={response.data.data ?? []}
        currentPage={page}
        totalPages={response.data.pages ?? 0}
        query={query ?? ''}
      />
    </Container>
  );
}
