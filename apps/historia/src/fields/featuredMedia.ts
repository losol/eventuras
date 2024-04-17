import { Field } from "payload/types";
import { Image } from '../blocks/image';

export const featuredMedia: Field = {

  name: 'featuredMedia',
  type: 'blocks',
  blocks: [Image],
  minRows: 0,
  maxRows: 7,
};
