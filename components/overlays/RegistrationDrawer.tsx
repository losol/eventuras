import { RegistrationDto } from '@losol/eventuras';
import { Heading, Text } from 'components/content';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface RegistrationDrawerProps {
  registration: RegistrationDto;
  isOpen: boolean;
  onClose: (v: boolean) => void;
}

const RegistrationDrawer = ({
  registration,
  isOpen,
  onClose,
}: RegistrationDrawerProps): JSX.Element => {
  function handleOpenChange(open: boolean) {
    if (!open) onClose(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Registrering</SheetTitle>
        </SheetHeader>

        <div>
          <Heading as="h2">Bruker</Heading>
          <Text>Navn: {registration.user?.name}</Text>
          <Text>E-post: {registration.user?.email}</Text>
          <Text>Mobil: {registration.user?.phoneNumber}</Text>

          <Heading as="h2">Detaljer</Heading>
          <Text>Status: {registration.status}</Text>
          <Text>Type: {registration.type}</Text>

          <Heading as="h2">Notater</Heading>
          <Text>{registration.notes}</Text>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RegistrationDrawer;
