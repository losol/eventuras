/* eslint-disable */

import { UsersService } from '@losol/eventuras';
import { DataTable } from 'components/datadisplay';
import { Loading, Unauthorized } from 'components/feedback';
import { Button } from 'components/inputs';
import { Container, Layout } from 'components/layout';
import { UserDrawer } from 'components/overlays';
import { Heading } from 'components/typography';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

const AdminUsersIndex = () => {
  const { data: session, status } = useSession();

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
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
            <Button key={row.original.id} onClick={() => openUserdetails(row.original.id)}>
              Detaljer
            </Button>
          );
        },
      },
    ],
    []
  );

  const getUsersList = async page => {
    const users = await UsersService.getV3Users1({ page: page });
    if (users.data && users.data.length > 0) {
      setUsers(users.data);
    }
    setPages(users.pages);
    setCurrentPage(users.page);
  };

  const handlePageClick = page => {
    getUsersList(page);
  };

  const userDrawerToggle = () => {
    setUserDrawerOpen(!userDrawerOpen);
  };

  const handleAddUserClick = () => {
    const newUser = { email: '', name: '' };
    setActiveUser(newUser);
    userDrawerToggle();
  };

  const handleSubmitNewUser = async user => {
    const newUser = await UsersService.postV3Users(user).catch(error => toaster.error(error));

    if (newUser) {
      toaster.success(`${newUser.name} is now a user.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const handleSubmitUpdateUser = async user => {
    const updatedUser = await UsersService.putV3Users(user.id, user).catch(toaster.error);

    if (updatedUser) {
      toaster.success(`${updatedUser.name} was updated.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const openUserdetails = async userId => {
    const user = await UsersService.getV3Users(userId);
    if (user) {
      setActiveUser(user);
    }

    userDrawerToggle();
  };

  useEffect(() => {
    if (status !== 'loading') {
      getUsersList(currentPage);
    }
  }, [status]);

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
        {activeUser && (
          <UserDrawer
            user={activeUser}
            isOpen={userDrawerOpen}
            onClose={userDrawerToggle}
            handleUserChange={event =>
              setActiveUser({
                ...activeUser,
                [event.target.id]: event.target.value,
              })
            }
            onSubmit={() => {
              if (activeUser.id) {
                handleSubmitUpdateUser(activeUser);
              } else {
                handleSubmitNewUser(activeUser);
              }
            }}
          />
        )}

        <Container>
          <Heading as="h1">
            <Link href="/admin/">Admin</Link> &gt; Brukere
          </Heading>

          <Button onClick={handleAddUserClick}>Add user</Button>

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
