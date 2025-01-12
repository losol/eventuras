'use client'
import React, { useEffect } from 'react'
import { TextFieldClientProps } from 'payload'

import { useField, TextInput, FieldLabel, useFormFields } from '@payloadcms/ui'

// import 'index.scss'


export const PersonNameComponent: React.FC<TextFieldClientProps> = ({
  field,
  path,
  readOnly: readOnlyFromProps,
 }) => {
  const { label } = field;

  const { value, setValue } = useField<string>({ path });

  // Monitor individual name fields
  const givenName = useFormFields(([fields]) => fields?.given_name?.value as string);
  const middleName = useFormFields(([fields]) => fields?.middle_name?.value as string);
  const familyName = useFormFields(([fields]) => fields?.family_name?.value as string);

  useEffect(() => {
    // Concatenate name parts and update the `name` field
    const fullName = [givenName, middleName, familyName].filter(Boolean).join(' ');
    if (value !== fullName) {
      setValue(fullName);
    }
  }, [givenName, middleName, familyName, value, setValue]);

  return (
    <div className="field-type name-field-component">
      <div className="label-wrapper">
        <FieldLabel htmlFor={`field-${path}`} label={label} />
      </div>

      <TextInput
        value={value}
        onChange={setValue}
        path={path}
        readOnly={true}
      />
    </div>
  );
};
