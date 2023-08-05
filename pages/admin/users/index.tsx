/* eslint-disable */

import { UserDto, UsersService } from '@losol/eventuras';
import { Loading, Unauthorized } from 'components/feedback';
import { Container, Layout } from 'components/layout';
import { DataTable, Heading } from 'components/content';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

const AdminUsersIndex = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [currentPage] = useState(1);

  const fetchUsers = async (page: number) => {
    try {
      const response = await UsersService.getV3Users1({ page });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      const usersData = await fetchUsers(currentPage);
      setUsers(usersData);
    };

    getUsers(); // Call the async function to fetch users
  }, [currentPage]); // Run the effect whenever currentPage changes

  // consider useMemo here or something smarter
  const columnHelper = createColumnHelper<UserDto>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'E-mail',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'Phone',
      cell: info => info.getValue(),
    }),
  ];

  if (status === 'loading') {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!session)
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        <Container>
          <Heading as="h1">
            <Link href="/admin/">Admin</Link> &gt; users
          </Heading>

          <DataTable columns={columns} data={users} />
        </Container>
      </Layout>
    );
  }
};

export default AdminUsersIndex;
