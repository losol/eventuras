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
import { EmailEditor } from 'components';
import { Dispatch, SetStateAction } from 'react';

interface EmailDrawerProps {
  isOpen: boolean;
  onClose: any;
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
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Create a new email
          </DrawerHeader>

          <DrawerBody>
            <EmailEditor
              participantGroups={recipientGroups}
              selectedRecipientGroups={selectedRecipientGroups}
              handleParticipantGroupsChange={(group: string) =>
                handleParticipantGroupsChange(group)
              }
              setEmailBody={setEmailBody}
              setSubject={setSubject}
            />
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default EmailDrawer;
