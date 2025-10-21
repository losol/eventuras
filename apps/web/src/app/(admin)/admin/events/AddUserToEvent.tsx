'use client';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import {
  EventDto,
  NewRegistrationDto,
  ProductDto,
  RegistrationType,
  UserDto,
} from '@eventuras/event-sdk';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Check } from '@eventuras/ratio-ui/icons';
import { Logger } from '@eventuras/logger';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import ProductSelection from '@/components/eventuras/ProductSelection';
import UserLookup from '@/components/eventuras/UserLookup';
import { useToast } from '@eventuras/toast';
import { RegistrationProduct } from '@/types';
import { createEventRegistration } from '@/app/(user)/user/events/actions';
import { mapEventProductsToView, mapSelectedProductsToQuantity } from '@/utils/api/mappers';
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
const RegistrationListBoxItem = (props: ListBoxItemProps & { children: React.ReactNode }) => (
  <ListBoxItem
    {...props}
    className="cursor-pointer group flex items-center gap-2 select-none py-2 px-4 outline-hidden rounded-sm text-gray-900 focus:bg-blue-100  focus:text-blue-900"
  >
    {({ isSelected }) => (
      <>
        <span className="flex-1 flex items-center gap-2 truncate font-normal group-selected:font-medium">
          {props.children}
        </span>
        <span className="w-5 flex items-center text-black group-focus:text-white">
          {isSelected && <Check className="h-5 w-5" aria-hidden="true" />}
        </span>
      </>
    )}
  </ListBoxItem>
);
const renderRegistrationTypeItem = (value: any) => (
  <RegistrationListBoxItem textValue={value} value={value} id={value} key={value}>
    {value}
  </RegistrationListBoxItem>
);
const AddUserCard: React.FC<AddUserCardProps> = ({
  user,
  eventinfo,
  products,
  onRemove,
  onUseradded,
}) => {
  const toast = useToast();
  const t = useTranslations();
  const logger = Logger.create({ namespace: 'web:admin:events', context: { component: 'AddUserToEvent' } });
  const { control, register, setValue, handleSubmit } = useForm<AddUserToEventFormValues>();
  useEffect(() => {
    setValue('registrationType', 'Participant'); //default to participant
  }, [setValue]);
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
    try {
      const result = await createEventRegistration(newRegistration, productMap);
      if (result.success) {
        logger.info({ userId: user.id }, 'User successfully added to the event!');
        toast.success(result.message || 'User successfully added to the event!');
        onUseradded(user);
      } else {
        logger.error({ error: result.error, userId: user.id }, 'Failed to add user to event');
        toast.error(result.error.message);
      }
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Unexpected error adding user to event');
      toast.error(t('common.errors.fatalError.title'));
    }
  };
  return (
    <form className="" onSubmit={handleSubmit(onSubmitForm)}>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <Controller
        control={control}
        name="registrationType"
        render={({ field: { onChange, onBlur } }) => {
          const registrationTypeOptions: RegistrationType[] = [
            'Participant',
            'Student',
            'Staff',
            'Lecturer',
            'Artist',
          ];
          return (
            <Select
              className="flex flex-col gap-1 w-[200px]"
              defaultSelectedKey="Participant"
              onBlur={onBlur}
              onSelectionChange={onChange}
            >
              <Label className="text-white cursor-default">Registration Type</Label>
              <AriaButton className="flex items-center cursor-default border-0 bg-white bg-opacity-90 pressed:bg-opacity-100 transition pl-5 text-base text-left leading-normal shadow-md text-gray-700 focus:outline-hidden focus-visible:ring-2 ring-white ring-offset-2 ring-offset-rose-700">
                <SelectValue className="flex-1 truncate placeholder-shown:italic" />
                <div className="text-white p-2 bg-primary-600">▼</div>
              </AriaButton>
              <Popover className="max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
                <ListBox className="outline-hidden p-1">
                  {registrationTypeOptions.map(value => renderRegistrationTypeItem(value))}
                </ListBox>
              </Popover>
            </Select>
          );
        }}
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
        <Heading as="h2">Add users to event</Heading>
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
