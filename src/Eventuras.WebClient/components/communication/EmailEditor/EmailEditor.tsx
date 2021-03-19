import {
  Badge,
  Checkbox,
  CheckboxGroup,
  Heading,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";

import { Header } from "../../common";
import dynamic from "next/dynamic";

const DynamicMarkdownEditor = dynamic(() => import("../MarkdownEditor/MarkdownEditor"), {
  ssr: false,
});

interface EmailEditorProps {
  participantGroups: string[];
}

const EmailEditor = (props: EmailEditorProps): JSX.Element => {
  const [emailBody, setEmailBody] = useState("");
  return (
    <>
      <Stack spacing="24px" marginTop="16">
        <Badge colorScheme="red" padding="2">
          Not implemented
        </Badge>
        <CheckboxGroup>
          {props.participantGroups &&
            props.participantGroups.map((group) => (
              <Checkbox name="{group}" id="{group}">
                {group}
              </Checkbox>
            ))}
        </CheckboxGroup>
        <Heading as="h2" fontSize="xl">
          Subject
        </Heading>
        <Input placeholder="Email subject" />

        <Heading as="h2" fontSize="xl">
          Content
        </Heading>
        <DynamicMarkdownEditor data="" onChange={(v) => setEmailBody(v)} />
      </Stack>
    </>
  );
};

export default EmailEditor;
