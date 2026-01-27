'use client';
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
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Checkbox } from '@eventuras/ratio-ui/forms';
import { Check } from '@eventuras/ratio-ui/icons';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { useToast } from '@eventuras/toast';

import { createEventRegistration } from '@/app/(user)/user/events/actions';
import ProductSelection from '@/components/eventuras/ProductSelection';
import UserLookup from '@/components/eventuras/UserLookup';
import {
  EventDto,
  NewRegistrationDto,
  ProductDto,
  RegistrationType,
  UserDto,
} from '@/lib/eventuras-sdk';
import { mapSelectedProductsToQuantity } from '@/utils/api/mappers';
type AddUserToEventFormValues = {
  registrationType: string;
  freeRegistration: boolean;
  products: Record<string, boolean | number>;
};
type AddUserCardProps = {
  user: UserDto;
  eventinfo: EventDto;
  onUseradded: (user: UserDto) => void;
  products: ProductDto[];
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
const renderRegistrationTypeItem = (value: RegistrationType) => (
  <RegistrationListBoxItem textValue={value} id={value} key={value}>
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
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'AddUserToEvent' },
  });
  const { control, register, setValue, handleSubmit } = useForm<AddUserToEventFormValues>();
  useEffect(() => {
    setValue('registrationType', 'Participant'); //default to participant
  }, [setValue]);
  const onSubmitForm = async (values: AddUserToEventFormValues) => {
    const productMap = mapSelectedProductsToQuantity(products, values.products);

    const newRegistration: NewRegistrationDto = {
      userId: user.id!,
      eventId: eventinfo.id!,
      type: values.registrationType as RegistrationType,
      createOrder: true,
      freeRegistration: values.freeRegistration || null,
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
    <form
      className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-slate-700"
      onSubmit={handleSubmit(onSubmitForm)}
    >
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
      </div>

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
              className="flex flex-col gap-1 w-full"
              defaultSelectedKey="Participant"
              onBlur={onBlur}
              onSelectionChange={onChange}
            >
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration Type
              </Label>
              <AriaButton className="flex items-center cursor-default border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pressed:bg-gray-50 dark:pressed:bg-gray-700 transition pl-3 pr-2 py-2 text-sm text-left leading-normal shadow-sm text-gray-700 dark:text-gray-300 focus:outline-hidden focus-visible:ring-2 ring-blue-500 rounded-md">
                <SelectValue className="flex-1 truncate placeholder-shown:italic" />
                <div className="text-gray-500 dark:text-gray-400 px-2">▼</div>
              </AriaButton>
              <Popover className="max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white dark:bg-gray-800 text-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
                <ListBox className="outline-hidden p-1">
                  {registrationTypeOptions.map(value => renderRegistrationTypeItem(value))}
                </ListBox>
              </Popover>
            </Select>
          );
        }}
      />

      <div className="flex items-center gap-2">
        <Checkbox id="freeRegistration" {...register('freeRegistration')}>
          <label
            htmlFor="freeRegistration"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Free Registration (no payment required)
          </label>
        </Checkbox>
      </div>

      {products.length > 0 && (
        <div className="space-y-2">
          <Heading as="h4" className="text-base font-semibold">
            Products
          </Heading>
          <ProductSelection
            products={products}
            register={register}
            selectedProducts={[]}
            isAdmin={true}
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="primary" type="submit" className="flex-1">
          Add User
        </Button>
        <Button type="button" variant="outline" onClick={() => onRemove(user)} className="flex-1">
          Cancel
        </Button>
      </div>
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
    <Drawer isOpen={isOpen!} onCancel={onCancel}>
      <Drawer.Header as="h2">Add users to event</Drawer.Header>

      <Drawer.Body>
        <div className="space-y-4">
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
              products={eventProducts}
              key={user.id}
            />
          ))}
        </div>
      </Drawer.Body>
    </Drawer>
  );
};
export type AddUserToEventProps = {
  eventinfo: EventDto;
  eventProducts: ProductDto[];
  isOpen?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'light';
  onUserAdded?: () => void | Promise<void>;
};
const AddUserToEvent: React.FC<AddUserToEventProps> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const logger = Logger.create({
    namespace: 'web:admin:events',
    context: { component: 'AddUserToEvent' },
  });

  const handleUserAdded = async () => {
    logger.info('User added, refreshing participants list and closing drawer');
    setIsOpen(false); // Close the drawer first

    if (props.onUserAdded) {
      await props.onUserAdded(); // Call parent callback to refresh participants
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={props.variant || 'primary'}
        id="add-user-to-event-button"
      >
        Add user
      </Button>
      <AddUserToEventDrawer
        eventinfo={props.eventinfo}
        eventProducts={props.eventProducts}
        onUseradded={handleUserAdded}
        onCancel={() => {
          setIsOpen(false);
        }}
        isOpen={isOpen}
      />
    </>
  );
};
export default AddUserToEvent;
