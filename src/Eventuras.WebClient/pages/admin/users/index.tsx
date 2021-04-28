import { Button, Container, Heading } from '@chakra-ui/react';
import { DataTable, Layout, Link } from '@components/common';
import { Loading, UserDrawer } from '@components/common';
import Unauthorized from '@components/common/Unauthorized/Unauthorized';
import { getUser, User } from '@lib/User';
import { getSession, useSession } from 'next-auth/client';
import React, { useEffect, useMemo, useState } from 'react';

const AdminUsersIndex = (): JSX.Element => {
  const [session, loading] = useSession();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const count = 100;
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'E-mail',
        accessor: 'email',
      },
      {
        Header: 'Phone',
        accessor: 'phoneNumber',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: function RenderCell({ row }) {
          return (
            <Button
              key={row.original.id}
              onClick={() => openUserdetails(row.original.id)}
            >
              Detaljer
            </Button>
          );
        },
      },
    ],
    []
  );

  const getUsersList = async (page) => {
    const session = await getSession({});
    fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL +
        `/v3/users?page=${page}&count=${count}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then((result) => {
        setUsers(result.data);
        setPages(result.pages);
        setCurrentPage(result.page);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePageClick = (page) => {
    getUsersList(page);
  };

  const userDrawerToggle = () => {
    setUserDrawerOpen(!userDrawerOpen);
  };

  const openUserdetails = async (userId: string) => {
    const session = await getSession({});
    const user = await getUser(userId, session.accessToken);
    if (user) {
      setSelectedUser(user);
    }

    userDrawerToggle();
  };

  useEffect(() => {
    getUsersList(currentPage);
  }, []);

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!loading && !session)
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        {selectedUser && (
          <UserDrawer
            user={selectedUser}
            isOpen={userDrawerOpen}
            onClose={userDrawerToggle}
            onSubmit={() => {
              return;
            }}
          />
        )}

        <Container paddingTop="32">
          <Heading as="h1" paddingBottom="16">
            <Link href="/admin/">Admin</Link> &gt; Brukere
          </Heading>

          <DataTable
            columns={columns}
            data={users}
            handlePageClick={handlePageClick}
            totalPages={pages}
            page={currentPage}
          />
        </Container>
      </Layout>
    );
  }
};

export default AdminUsersIndex;
