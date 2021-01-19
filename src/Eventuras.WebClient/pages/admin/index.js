import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Button, Container, Heading, List, ListItem, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react";
import { Layout, Link } from "../../components/common";
import React from "react";
import useApi from "../../lib/useApi";

function AdminIndex() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const { data: registrations } = useApi("/v3/registrations");
  const { data: events } = useApi("/v3/events");
  const { data: onlineCourses } = useApi("/v3/onlinecourses");

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <Container paddingTop="32">
          <Heading as="h1">Admin</Heading>

          <Heading as="h2" fontSize="2xl" marginTop="16">Events</Heading>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Title</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events && events.map((event) =>
                <Tr>
                  <Td>{event.startDate}</Td>
                  <Td>{event.name}</Td>
                  <Td><Link href={`/admin/event/${event.id}`}><Button colorScheme="teal" variant="outline">Edit</Button></Link></Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Heading as="h2" fontSize="2xl" marginTop="16">Online courses</Heading>

          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Course name</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {onlineCourses && onlineCourses.map((event) =>
                <Tr>
                  <Td>{event.name}</Td>
                  <Td><Button colorScheme="teal" variant="outline">Edit</Button></Td>
                </Tr>
              )}
            </Tbody>
          </Table>

          <Heading as="h2" fontSize="2xl" marginTop="16">Siste registreringer</Heading>


          <List>
            {registrations && registrations.map((r) => <ListItem>{r.registrationId}, {r.userId}</ListItem>)}
          </List>

        </Container >
      </Layout >
    );
  } else {
    return <button onClick={loginWithRedirect}>Log in</button>;
  }
}

export default withAuthenticationRequired(AdminIndex);
