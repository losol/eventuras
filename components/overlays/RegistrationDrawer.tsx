import { RegistrationDto } from '@losol/eventuras';
import { Drawer } from '@mantine/core';
import { Heading, Text } from 'components/content';
import { Button } from 'components/inputs';

interface RegistrationDrawerProps {
  registration: RegistrationDto;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDrawer = (props: RegistrationDrawerProps): JSX.Element => {
  const { registration, onClose, isOpen } = props;

  return (
    <Drawer opened={isOpen} onClose={onClose} size="xl">
      <Drawer.Overlay>
        <Drawer.Content>
          <Drawer.CloseButton />
          <Drawer.Header>Registrering</Drawer.Header>

          <Drawer.Body>
            <Heading as="h2">Bruker</Heading>
            <Text>Navn: {registration.user?.name}</Text>
            <Text>E-post: {registration.user?.email}</Text>
            <Text>Mobil: {registration.user?.phoneNumber}</Text>

            <Heading as="h2">Detaljer</Heading>
            <Text>Status: {registration.status}</Text>
            <Text>Type: {registration.type}</Text>

            <Heading as="h2">Notater</Heading>
            <Text>{registration.notes}</Text>

            <Button onClick={onClose}>Cancel</Button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Overlay>
    </Drawer>
  );
};

export default RegistrationDrawer;
