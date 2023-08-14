import { UserDto, UsersService } from '@losol/eventuras';
import { Heading } from 'components/content';
import { Layout } from 'components/layout';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from 'utils/authOptions';

async function UserIndex() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return <Layout>Not logged in</Layout>;
  }

  const me: UserDto = await UsersService.getV3UsersMe();

  return (
    <Layout>
      <Heading as="h1">Hei {me.name}</Heading>
      <dl>
        <dt>Name</dt>
        <dd>{me.name}</dd>

        <dt>Email</dt>
        <dd>{me.email}</dd>

        <dt>Phonenumber</dt>
        <dd>{me.phoneNumber}</dd>
      </dl>
    </Layout>
  );
}

export default UserIndex;
