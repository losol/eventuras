import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types';

export const buildInitialFormState = (fields: FormFieldBlock[]) => {
  return fields?.reduce((initialSchema, field) => {
    // Narrow down fields to those that have the 'name' property
    if ('name' in field) {
      if (field.blockType === 'checkbox') {
        return {
          ...initialSchema,
          [field.name]: field.defaultValue,
        };
      }
      if (['country', 'email', 'text', 'select', 'state'].includes(field.blockType)) {
        return {
          ...initialSchema,
          [field.name]: '',
        };
      }
    }
    // If no conditions match, return the current state
    return initialSchema;
  }, {}); // Provide an initial value for reduce
};
