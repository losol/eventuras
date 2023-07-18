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
import { RegistrationType } from 'types';

interface RegistrationDrawerProps {
  registration: RegistrationType;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDrawer = (props: RegistrationDrawerProps): JSX.Element => {
  const { registration, onClose, isOpen } = props;
  const { user, status, type, notes } = registration;
  const { name, email, phoneNumber } = user;

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
            <Text>Navn: {name}</Text>
            <Text>E-post: {email}</Text>
            <Text>Mobil: {phoneNumber}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Detaljer
            </Heading>
            <Text>Status: {status}</Text>
            <Text>Type: {type}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Notater
            </Heading>
            <Text>{notes}</Text>
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
