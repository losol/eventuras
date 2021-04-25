import { Container, Heading } from '@chakra-ui/react';
import { DataTable, Layout, Link } from '@components/common';
import { getSession, useSession } from 'next-auth/client';
import React, { useEffect, useMemo, useState } from 'react';

function AdminUsersIndex() {
  const [session, loading, error] = useSession();
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
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
    ],
    []
  );
  const getUsersList = async (page) => {
    const token = await getSession();
    fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL +
        `/v3/users?page=${page}&count=${count}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.accessToken}`,
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
      .then((res) => {
        setUsers(res.data);
        setPages(res.pages);
        //setTotalPages(res.)
        setCurrentPage(res.page);
      })
      .catch(() => {
        console.log(error);
      });
  };

  const handlePageClick = (page) => {
    getUsersList(page);
  };

  useEffect(async () => {
    getUsersList(currentPage);
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (!loading && !session)
    return (
      <Layout>
        <p> Access Denied</p>
      </Layout>
    );

  if (session) {
    return (
      <Layout>
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
}

export default AdminUsersIndex;
