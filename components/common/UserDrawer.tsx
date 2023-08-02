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
import { FormEvent } from 'react';
import { UserType } from 'types';

interface UserDrawerProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  handleUserChange: (event: FormEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const UserDrawer = (props: UserDrawerProps): JSX.Element => {
  const { user, isOpen, onClose, handleUserChange, onSubmit } = props;

  // TODO: Use UserContext instead of props. This data repeating a lot. So this is state. Setup context globally. Perfectly with null user as initial state
  const { id, name, email, phoneNumber } = user;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">{name}</DrawerHeader>

          <DrawerBody>
            <VStack spacing={8}>
              <Badge>{id}</Badge>
              <FormControl id="name" isRequired={true}>
                <FormLabel>Name</FormLabel>
                <Input type="text" value={name} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="email" isRequired={true}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="phoneNumber">
                <FormLabel>Phone number</FormLabel>
                <Input
                  type="tel"
                  value={phoneNumber ?? ''}
                  onChange={handleUserChange}
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default UserDrawer;
