import { Field } from "payload";

export const url: Field = {
  name: 'url',
  type: 'text',
  validate: (value: string | null | undefined): true | string => {
    if (!value) return true;

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/\S*)?$/;
    return urlRegex.test(value) ? true : 'Please enter a valid URL.';
  },
};
