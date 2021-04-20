import {
  Badge,
  Checkbox,
  CheckboxGroup,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction } from 'react';

const DynamicMarkdownEditor = dynamic(
  () => import('../MarkdownEditor/MarkdownEditor'),
  {
    ssr: false,
  }
);

interface EmailEditorProps {
  participantGroups: string[];
  selectedRecipientGroups: string[];
  handleParticipantGroupsChange: any;
  setEmailBody: Dispatch<SetStateAction<string>>;
  setSubject: Dispatch<SetStateAction<string>>;
}

const EmailEditor = (props: EmailEditorProps): JSX.Element => {
  return (
    <>
      <Stack spacing="24px" marginTop="16">
        <Badge colorScheme="red" padding="2">
          Not implemented
        </Badge>
        <CheckboxGroup>
          {props.participantGroups &&
            props.participantGroups.map((group) => (
              <Checkbox
                name={group}
                id={group}
                isChecked={props.selectedRecipientGroups.includes(group)}
                key={`participant_checkbox_${group}`}
                onChange={(event) => props.handleParticipantGroupsChange(group)}
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
            console.log(e.target.value), props.setSubject(e.target.value);
          }}
        />

        <Heading as="h2" fontSize="xl">
          Content
        </Heading>
        <DynamicMarkdownEditor
          data=""
          onChange={(v) => props.setEmailBody(v)}
        />
      </Stack>
    </>
  );
};

export default EmailEditor;
