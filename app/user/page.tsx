'use client';

//import { UsersService } from '@losol/eventuras';
import { Heading } from 'components/content';
import { Container } from 'components/layout';
import { useSession } from 'next-auth/react';

//async function getCurrentUser() {
//  return await UsersService.getV3UsersMe(); // parse issue
//}

export default function UserPage() {
  const { data: session } = useSession();
  return (
    <Container>
      <Heading>Heihei {session?.user?.name}</Heading>
    </Container>
  );
}
