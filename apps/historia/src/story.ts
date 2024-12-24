import { Field } from "payload";
import { Content } from "@/blocks/content/config";

export const story: Field = {
  name: 'story',
  label: 'Story',
  type: 'blocks',
  blocks: [Content],
};
