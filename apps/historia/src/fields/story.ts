import { Field } from "payload/types";
import { Content } from "../blocks/content";

export const story: Field = {
  name: 'story',
  label: 'Story',
  type: 'blocks',
  blocks: [Content],
};
