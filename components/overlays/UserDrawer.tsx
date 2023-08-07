import { Text } from 'components/content';
import { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { UserType } from 'types';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface UserDrawerProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  handleUserChange: (event: FormEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

// TODO
const UserDrawer = (props: UserDrawerProps): JSX.Element => {
  const { user, onClose, onSubmit } = props;
  const { id, name, email, phoneNumber } = user;
  const {
    formState: { errors },
  } = useForm();
  console.log(errors);

  return (
    //<Drawer opened={isOpen} position="right" onClose={onClose} size="xl">
    //  <Drawer.Overlay>
    //    <Drawer.Content>
    //      <Drawer.CloseButton />
    //      <Drawer.Header>{name}</Drawer.Header>

    //      <Drawer.Body>
    //        <Text>{id}</Text>
    //        <Text>Email: {email}</Text>
    //        <Text>Phone number: {phoneNumber}</Text>
    //      </Drawer.Body>

    //      <Button onClick={onClose}>Cancel</Button>
    //      <Button onClick={onSubmit}>Submit</Button>
    //    </Drawer.Content>
    //  </Drawer.Overlay>
    //</Drawer>
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{name}</SheetTitle>
        </SheetHeader>

        <div>
          <Text>{id}</Text>
          <Text>Email: {email}</Text>
          <Text>Phone number: {phoneNumber}</Text>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={onClose}>Cancel</Button>
          </SheetClose>
          <Button type="submit" onSubmit={onSubmit}>
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserDrawer;
