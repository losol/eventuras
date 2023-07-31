import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  Text,
} from '@chakra-ui/react';
import { RegistrationDto } from '@losol/eventuras';

interface RegistrationDrawerProps {
  registration: RegistrationDto;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDrawer = (props: RegistrationDrawerProps): JSX.Element => {
  const { registration, onClose, isOpen } = props;
  // const { user, status, type, notes } = registration;
  // const { name, email, phoneNumber } = user!;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Registrering</DrawerHeader>

          <DrawerBody>
            <Heading as="h2" size="md" paddingTop="6">
              Bruker
            </Heading>
            <Text>Navn: {registration.user?.name}</Text>
            <Text>E-post: {registration.user?.email}</Text>
            <Text>Mobil: {registration.user?.phoneNumber}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Detaljer
            </Heading>
            <Text>Status: {registration.status}</Text>
            <Text>Type: {registration.type}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Notater
            </Heading>
            <Text>{registration.notes}</Text>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default RegistrationDrawer;
