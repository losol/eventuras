import { Field } from "payload/types";
import { Image } from '../blocks/image';

export const image: Field = {
  name: 'image',
  type: 'blocks',
  blocks: [Image],
  minRows: 0,
  maxRows: 1,
};
