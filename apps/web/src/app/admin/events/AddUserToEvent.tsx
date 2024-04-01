import { DropdownSelect } from '@eventuras/forms';
import {
  EventDto,
  NewRegistrationDto,
  ProductDto,
  RegistrationType,
  UserDto,
} from '@eventuras/sdk';
import { Drawer } from '@eventuras/ui';
import { Heading } from '@eventuras/ui';
import { Button } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import ProductSelection from '@/components/eventuras/ProductSelection';
import UserLookup from '@/components/eventuras/UserLookup';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { RegistrationProduct } from '@/types';
import { createEventRegistration } from '@/utils/api/functions/events';
import { mapEventProductsToView, mapSelectedProductsToQuantity } from '@/utils/api/mappers';
import { mapEnum } from '@/utils/enum';

type AddUserToEventFormValues = {
  registrationType: string;
  products: any;
};

type AddUserCardProps = {
  user: UserDto;
  eventinfo: EventDto;
  onUseradded: (user: UserDto) => void;
  products: RegistrationProduct[];
  onRemove: (u: UserDto) => void;
};

export const AddUserButton: React.FC = () => {
  return (
    <>
      <Button>Add user</Button>;{' '}
    </>
  );
};

const AddUserCard: React.FC<AddUserCardProps> = ({
  user,
  eventinfo,
  products,
  onRemove,
  onUseradded,
}) => {
  const { addAppNotification } = useAppNotifications();
  const { t } = createTranslation();

  const {
    control,
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<AddUserToEventFormValues>();

  useEffect(() => {
    setValue('registrationType', RegistrationType.PARTICIPANT); //default to participant
  }, []);

  const onSubmitForm = async (values: AddUserToEventFormValues) => {
    const productMap =
      products && products?.length
        ? mapSelectedProductsToQuantity(products, values.products)
        : new Map();
    const newRegistration: NewRegistrationDto = {
      userId: user.id!,
      eventId: eventinfo.id!,
      type: values.registrationType as RegistrationType,
      createOrder: true,
      customer: {
        name: user.name,
        email: user.email,
      },
    };
    const result = await createEventRegistration(newRegistration, productMap);

    if (result.ok) {
      Logger.info({ namespace: 'AddUserToEvent' }, 'User succesfully added to the event!');
      addAppNotification({
        id: Date.now(),
        message: 'User succesfully added to the event!',
        type: AppNotificationType.SUCCESS,
      });
      onUseradded(user);
    } else {
      Logger.error({ namespace: 'AddUserToEvent' }, result.error);
      if (result.error!.status === 409) {
        addAppNotification({
          id: Date.now(),
          message: 'That user is already registered to the event',
          type: AppNotificationType.ERROR,
        });
        return;
      }
      addAppNotification({
        id: Date.now(),
        message: t('common:errors.fatalError.title'),
        type: AppNotificationType.ERROR,
      });
      throw new Error('Failed to add user to event');
    }
  };

  return (
    <form className="" onSubmit={handleSubmit(onSubmitForm)}>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <DropdownSelect
        className="relative z-9"
        label="Registration Type"
        control={control}
        rules={{ required: 'Choose at least one Registration type for this User' }}
        name="registrationType"
        errors={errors}
        options={mapEnum(RegistrationType, (value: any) => ({
          id: value,
          label: value,
        }))}
        multiSelect={false}
      />
      {products.length > 0 && (
        <>
          <Heading as="h4">Choose Products</Heading>
          <ProductSelection products={products} register={register} selectedProducts={[]} />
        </>
      )}
      <Button variant="light" type="submit">
        Add
      </Button>
      <Button
        type="reset"
        variant="light"
        onClick={() => {
          onRemove(user);
        }}
      >
        Clear
      </Button>
    </form>
  );
};

export type AddUserToEventDrawerProps = {
  eventinfo: EventDto;
  eventProducts: ProductDto[];
  onUseradded: (user: UserDto) => void;
  isOpen?: boolean;
  onCancel?: () => void;
};

const AddUserToEventDrawer: React.FC<AddUserToEventDrawerProps> = ({
  eventinfo,
  eventProducts,
  onUseradded,
  isOpen,
  onCancel,
}) => {
  const [usersToAdd, setUsersToAdd] = useState<UserDto[]>([]);
  return (
    <>
      <Drawer isOpen={isOpen!} onCancel={onCancel}>
        <Heading as="h2">Add users to event </Heading>
        <UserLookup
          onUserSelected={(u: UserDto) => {
            setUsersToAdd([...usersToAdd, u]);
          }}
        />
        {usersToAdd.map(user => (
          <AddUserCard
            user={user}
            onUseradded={u => {
              setUsersToAdd([...usersToAdd].filter(us => u.id !== us.id));
              onUseradded(u);
            }}
            onRemove={u => {
              setUsersToAdd([...usersToAdd].filter(us => u.id !== us.id));
            }}
            eventinfo={eventinfo}
            products={mapEventProductsToView(eventProducts)}
            key={user.id}
          />
        ))}
      </Drawer>
    </>
  );
};

export type AddUserToEventProps = {
  eventinfo: EventDto;
  eventProducts: ProductDto[];
  isOpen?: boolean;
};

const AddUserToEvent: React.FC<AddUserToEventProps> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add user</Button>
      <AddUserToEventDrawer
        eventinfo={props.eventinfo}
        eventProducts={props.eventProducts}
        onUseradded={() => router.refresh()}
        onCancel={() => {
          setIsOpen(false);
        }}
        isOpen={isOpen}
      />
    </>
  );
};

export default AddUserToEvent;
