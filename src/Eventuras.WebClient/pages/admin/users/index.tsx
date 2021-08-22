import { Button, Container, Heading } from '@chakra-ui/react';
import {
  DataTable,
  Layout,
  Link,
  Loading,
  UserDrawer,
} from '@components/common';
import Unauthorized from '@components/common/Unauthorized/Unauthorized';
import { fetcher } from '@lib/fetcher';
import { toaster } from '@lib/toaster';
import { createUser, getUserById, updateUser, User } from '@lib/User';
import { useSession } from 'next-auth/client';
import React, { useEffect, useMemo, useState } from 'react';

const AdminUsersIndex = (): JSX.Element => {
  const [session, loading] = useSession();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState<User>();
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
    const userList = await fetcher.get(
      `/v3/users?page=${page}&count=${count}`,
      {
        accessToken: session.accessToken,
      }
    );

    setUsers(userList.data);
    setPages(userList.pages);
    setCurrentPage(userList.page);
  };

  const handlePageClick = (page) => {
    getUsersList(page);
  };

  const userDrawerToggle = () => {
    setUserDrawerOpen(!userDrawerOpen);
  };

  const handleAddUserClick = () => {
    const newUser: User = { email: '', name: '' };
    setActiveUser(newUser);
    userDrawerToggle();
  };

  const handleSubmitNewUser = async (user: User) => {
    const newUser = await createUser(user, session.accessToken).catch((error) =>
      toaster.error(error)
    );

    if (newUser) {
      toaster.success(`${newUser.name} is now a user.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const handleSubmitUpdateUser = async (user: User) => {
    const updatedUser = await updateUser(user, session.accessToken).catch(
      (error) => toaster.error(error)
    );

    if (updatedUser) {
      toaster.success(`${updatedUser.name} was updated.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const openUserdetails = async (userId: string) => {
    const user = await getUserById(userId, session.accessToken);
    if (user) {
      setActiveUser(user);
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
        {activeUser && (
          <UserDrawer
            user={activeUser}
            isOpen={userDrawerOpen}
            onClose={userDrawerToggle}
            handleUserChange={(event) =>
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

        <Container paddingTop="32">
          <Heading as="h1" paddingBottom="16">
            <Link href="/admin/">Admin</Link> &gt; Brukere
          </Heading>

          <Button
            colorScheme="teal"
            variant="outline"
            onClick={handleAddUserClick}
          >
            Add user
          </Button>

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
