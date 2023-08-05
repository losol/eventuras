import { Drawer } from '@mantine/core';
import { Text } from 'components/content';
import { Button } from 'components/inputs';
import { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { UserType } from 'types';

interface UserDrawerProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  handleUserChange: (event: FormEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const UserDrawer = (props: UserDrawerProps): JSX.Element => {
  const { user, isOpen, onClose, onSubmit } = props;
  const { id, name, email, phoneNumber } = user;
  const {
    formState: { errors },
  } = useForm();
  console.log(errors);

  return (
    <Drawer opened={isOpen} position="right" onClose={onClose} size="xl">
      <Drawer.Overlay>
        <Drawer.Content>
          <Drawer.CloseButton />
          <Drawer.Header>{name}</Drawer.Header>

          <Drawer.Body>
            <Text>{id}</Text>
            <Text>Email: {email}</Text>
            <Text>Phone number: {phoneNumber}</Text>
          </Drawer.Body>

          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Submit</Button>
        </Drawer.Content>
      </Drawer.Overlay>
    </Drawer>
  );
};

export default UserDrawer;
