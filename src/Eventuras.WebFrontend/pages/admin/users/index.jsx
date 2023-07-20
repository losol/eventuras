import { Button, Container, Heading } from '@chakra-ui/react';
import {
  DataTable,
  Layout,
  Link,
  Loading,
  Unauthorized,
  UserDrawer,
} from 'components';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import {
  createUser,
  fetcher,
  getUserById,
  toaster,
  updateUser,
} from 'services';
import { UserType } from 'types';

const AdminUsersIndex = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState();
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
        accessToken: session.user.accessToken,
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
    const newUser = { email: '', name: '' };
    setActiveUser(newUser);
    userDrawerToggle();
  };

  const handleSubmitNewUser = async (user) => {
    const newUser = await createUser(user, session.user.accessToken).catch(
      (error) => toaster.error(error)
    );

    if (newUser) {
      toaster.success(`${newUser.name} is now a user.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const handleSubmitUpdateUser = async (user) => {
    const updatedUser = await updateUser(user, session.user.accessToken).catch(
      (error) => toaster.error(error)
    );

    if (updatedUser) {
      toaster.success(`${updatedUser.name} was updated.`);
      setActiveUser(null);
      getUsersList(currentPage);
    }
  };

  const openUserdetails = async (userId) => {
    const user = await getUserById(userId, session.user.accessToken);
    if (user) {
      setActiveUser(user);
    }

    userDrawerToggle();
  };

  useEffect(() => {
    getUsersList(currentPage);
  }, []);

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
