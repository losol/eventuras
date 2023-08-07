import { Heading } from 'components/content';
import { Dispatch, SetStateAction } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface EmailEditorProps {
  participantGroups: string[];
  selectedRecipientGroups: string[];
  handleParticipantGroupsChange: (group: string) => void;
  setEmailBody: Dispatch<SetStateAction<string>>;
  setSubject: Dispatch<SetStateAction<string>>;
}

// TODO : make as form with validation
const EmailEditor = (props: EmailEditorProps): JSX.Element => {
  return (
    <div className="flex flex-col">
      {/*<Checkbox.Group
        defaultValue={['participants']}
        label="Select recipient"
        description="This is anonymous"
        withAsterisk
      >
        {props.participantGroups &&
          props.participantGroups.map(group => (
            <Checkbox
              name={group}
              id={group}
              checked={props.selectedRecipientGroups.includes(group)}
              key={`participant_checkbox_${group}`}
              onChange={() => props.handleParticipantGroupsChange(group)}
            ></Checkbox>
          ))}
      </Checkbox.Group>*/}

      {props.participantGroups &&
        props.participantGroups.map(group => (
          //<Checkbox
          //  name={group}
          //  id={group}
          //  checked={props.selectedRecipientGroups.includes(group)}
          //  key={`participant_checkbox_${group}`}
          //  onChange={() => props.handleParticipantGroupsChange(group)}
          //></Checkbox>

          <Checkbox
            key={`participant_checkbox_${group}`}
            checked={props.selectedRecipientGroups.includes(group)}
            onCheckedChange={() => {
              //if (checked) props.handleParticipantGroupsChange(group);
              //else props.handleParticipantGroupsChange(group);
              props.handleParticipantGroupsChange(group);
            }}
          />
        ))}

      <Heading as="h2">Subject</Heading>
      <Input
        type="email"
        placeholder="Email subject"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          props.setSubject(e.target.value);
        }}
      />

      <Heading as="h2">Content</Heading>
    </div>
  );
};

export default EmailEditor;
