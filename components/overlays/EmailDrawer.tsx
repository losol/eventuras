import { Drawer } from '@mantine/core';
import { EmailEditor } from 'components/editors';
import { Button } from 'components/inputs';
import { Dispatch, SetStateAction } from 'react';

interface EmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

  return (
    <Drawer opened={isOpen} position="right" onClose={onClose} size="xl">
      <Drawer.Overlay>
        <Drawer.Content>
          <Drawer.CloseButton />
          <Drawer.Header>Create a new email</Drawer.Header>

          <Drawer.Body>
            <EmailEditor
              participantGroups={recipientGroups}
              selectedRecipientGroups={selectedRecipientGroups}
              handleParticipantGroupsChange={group => handleParticipantGroupsChange(group)}
              setEmailBody={setEmailBody}
              setSubject={setSubject}
            />
          </Drawer.Body>

          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Submit</Button>
        </Drawer.Content>
      </Drawer.Overlay>
    </Drawer>
  );
};

export default EmailDrawer;
