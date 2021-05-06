import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { User } from '@lib/User';
import React from 'react';

interface UserDrawerProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  handleUserChange: (event) => void;
  onSubmit: () => void;
}

const UserDrawer = (props: UserDrawerProps): JSX.Element => {
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
          <DrawerHeader borderBottomWidth="1px">{props.user.name}</DrawerHeader>

          <DrawerBody>
            <VStack spacing={8}>
              <Badge>{props.user.id}</Badge>
              <FormControl id="name" isRequired={true}>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={props.user.name}
                  onChange={props.handleUserChange}
                />
              </FormControl>
              <FormControl id="email" isRequired={true}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={props.user.email}
                  onChange={props.handleUserChange}
                />
              </FormControl>
              <FormControl id="phoneNumber">
                <FormLabel>Phone number</FormLabel>
                <Input
                  type="tel"
                  value={props.user.phoneNumber}
                  onChange={props.handleUserChange}
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={props.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={props.onSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default UserDrawer;
