import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import { User } from '@lib/User';

interface UserDrawerProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
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
            Id: {props.user.id}
            <br />
            Navn: {props.user.name}
            <br />
            Navn: {props.user.email}
            <br />
            Navn: {props.user.phoneNumber}
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
