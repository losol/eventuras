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
import { Registration } from '@lib/Registration';
import React from 'react';

interface RegistrationDrawerProps {
  registration: Registration;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDrawer = (props: RegistrationDrawerProps): JSX.Element => {
  return (
    <Drawer
      isOpen={props.isOpen}
      placement="right"
      onClose={props.onClose}
      size="xl"
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Registrering</DrawerHeader>

          <DrawerBody>
            <Heading as="h2" size="md" paddingTop="6">
              Bruker
            </Heading>
            <Text>Navn: {props.registration.user.name}</Text>
            <Text>E-post: {props.registration.user.email}</Text>
            <Text>Mobil: {props.registration.user.phoneNumber}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Detaljer
            </Heading>
            <Text>Status: {props.registration.status}</Text>
            <Text>Type: {props.registration.type}</Text>

            <Heading as="h2" size="md" paddingTop="6">
              Notater
            </Heading>
            <Text>{props.registration.notes}</Text>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={props.onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default RegistrationDrawer;
