import { Field } from "payload";
import { Content } from "@/blocks/Content/config";

export const story: Field = {
  name: 'story',
  label: 'Story',
  type: 'blocks',
  blocks: [Content],
};
