import {
  EventDto,
  NewRegistrationDto,
  ProductDto,
  RegistrationType,
  UserDto,
} from '@losol/eventuras';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import DropdownSelect from '@/components/forms/DropdownSelect';
import { InputAutoComplete } from '@/components/forms/Input';
import ProductSelection from '@/components/forms/ProductSelection';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { RegistrationProduct } from '@/types/RegistrationProduct';
import { createEventRegistration } from '@/utils/api/functions/events';
import { getUsers } from '@/utils/api/functions/users';
import { mapEventProductsToView, mapSelectedProductsToQuantity } from '@/utils/api/mappers';
import { mapEnum } from '@/utils/enum';

type AddUserToEventFormValues = {
  registrationType: string;
  products: any;
};

type AddUserCardProps = {
  user: UserDto;
  event: EventDto;
  onUseradded: (user: UserDto) => void;
  products: RegistrationProduct[];
  onRemove?: (u: UserDto) => void;
};
const AddUserCard: React.FC<AddUserCardProps> = ({
  user,
  event,
  products,
  onRemove,
  onUseradded,
}) => {
  const { addAppNotification } = useAppNotifications();
  const { t: common } = useTranslation('common');

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
      eventId: event.id!,
      type: values.registrationType as RegistrationType,
      createOrder: true,
      customer: {
        name: user.name,
        email: user.email,
      },
    };
    const result = await createEventRegistration(newRegistration, productMap);

    if (result.ok) {
      addAppNotification({
        id: Date.now(),
        message: 'User succesfully added to the event!',
        type: AppNotificationType.SUCCESS,
      });
      onUseradded(user);
    } else {
      if (result.error.statusCode === 409) {
        addAppNotification({
          id: Date.now(),
          message: 'That user is already registered to the event',
          type: AppNotificationType.ERROR,
        });
        return;
      }
      addAppNotification({
        id: Date.now(),
        message: common('errors.fatalError.title'),
        type: AppNotificationType.ERROR,
      });
      throw new Error('Failed to add user to event');
    }
  };

  return (
    <form
      className="bg-slate-100 rounded-xl p-8 dark:bg-slate-700 m-4"
      onSubmit={handleSubmit(onSubmitForm)}
    >
      <Heading as="h4">User to add</Heading>
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
          <ProductSelection products={products} register={register} />
        </>
      )}
      <Button variant="light" type="submit">
        Add
      </Button>
      <Button
        variant="light"
        onClick={() => {
          if (onRemove) {
            onRemove(user);
          }
        }}
      >
        Clear
      </Button>
    </form>
  );
};
export type AddUserToEventProps = {
  event: EventDto;
  eventProducts: ProductDto[];
  onUseradded: (user: UserDto) => void;
};
const AddUserToEvent: React.FC<AddUserToEventProps> = ({ event, eventProducts, onUseradded }) => {
  const [usersToAdd, setUsersToAdd] = useState<UserDto[]>([]);
  return (
    <>
      <Heading as="h2">Add users to event </Heading>
      <InputAutoComplete
        id="find_user"
        placeholder="Find user"
        dataProvider={getUsers}
        minimumAmountOfCharacters={3}
        labelProperty="name"
        resetAfterSelect={true}
        onItemSelected={(u: UserDto) => {
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
          event={event}
          products={mapEventProductsToView(eventProducts)}
          key={user.id}
        />
      ))}
    </>
  );
};

export default AddUserToEvent;
