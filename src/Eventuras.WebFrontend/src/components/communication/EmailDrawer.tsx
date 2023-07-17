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
import { Dispatch, SetStateAction } from 'react';

import { EmailEditor } from 'components';

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
  return (
    <Drawer
      isOpen={props.isOpen}
      placement="right"
      onClose={props.onClose}
      size="xl"
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Create a new email
          </DrawerHeader>

          <DrawerBody>
            <EmailEditor
              participantGroups={props.recipientGroups}
              selectedRecipientGroups={props.selectedRecipientGroups}
              handleParticipantGroupsChange={(group) =>
                props.handleParticipantGroupsChange(group)
              }
              setEmailBody={props.setEmailBody}
              setSubject={props.setSubject}
            />
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={props.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={props.onSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default EmailDrawer;
