import { EmailEditor } from 'components/editors';
import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface EmailDrawerProps {
  isOpen: boolean;
  onClose: (v: boolean) => void;
  recipientGroups: string[];
  selectedRecipientGroups: string[];
  onSubmit: () => void;
  setEmailBody: Dispatch<SetStateAction<string>>;
  setSubject: Dispatch<SetStateAction<string>>;
  handleParticipantGroupsChange: (group: string) => void;
}

const EmailDrawer = (props: EmailDrawerProps): JSX.Element => {
  const {
    isOpen,
    onClose,
    recipientGroups,
    selectedRecipientGroups,
    handleParticipantGroupsChange,
    setEmailBody,
    setSubject,
    onSubmit,
  } = props;

  function handleOpenChange(open: boolean) {
    if (!open) onClose(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create a new email</SheetTitle>
        </SheetHeader>

        <div>
          <EmailEditor
            participantGroups={recipientGroups}
            selectedRecipientGroups={selectedRecipientGroups}
            handleParticipantGroupsChange={group => handleParticipantGroupsChange(group)}
            setEmailBody={setEmailBody}
            setSubject={setSubject}
          />
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </SheetClose>
          <Button type="submit" onSubmit={onSubmit}>
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EmailDrawer;
