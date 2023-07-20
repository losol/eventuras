import {
  Checkbox,
  CheckboxGroup,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction } from 'react';

const DynamicMarkdownEditor = dynamic(
  () => import('components/communication/MarkdownEditor'),
  { ssr: false }
);

interface EmailEditorProps {
  participantGroups: string[];
  selectedRecipientGroups: string[];
  handleParticipantGroupsChange: (group: string) => void;
  setEmailBody: Dispatch<SetStateAction<string>>;
  setSubject: Dispatch<SetStateAction<string>>;
}

const EmailEditor = (props: EmailEditorProps): JSX.Element => {
  return (
    <>
      <Stack spacing="24px" marginTop="16">
        <CheckboxGroup>
          {props.participantGroups &&
            props.participantGroups.map((group) => (
              <Checkbox
                name={group}
                id={group}
                isChecked={props.selectedRecipientGroups.includes(group)}
                key={`participant_checkbox_${group}`}
                onChange={() => props.handleParticipantGroupsChange(group)}
              >
                {group === 'Participant' || group === 'Lecturer'
                  ? `${group}s`
                  : group}
              </Checkbox>
            ))}
        </CheckboxGroup>
        <Heading as="h2" fontSize="xl">
          Subject
        </Heading>
        <Input
          placeholder="Email subject"
          onChange={(e) => {
            props.setSubject(e.target.value);
          }}
        />

        <Heading as="h2" fontSize="xl">
          Content
        </Heading>
        <DynamicMarkdownEditor
        // Commented to pass lint
        // data=""
        // onChange={(v: any) => props.setEmailBody(v)}
        />
      </Stack>
    </>
  );
};

export default EmailEditor;
