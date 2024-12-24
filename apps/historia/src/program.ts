import { Field } from "payload";
import { Content } from "../blocks/content/config";
import { Session } from "../blocks/session";

export const program: Field = {
  name: 'program',
  label: 'Program',
  type: 'blocks',
  blocks: [Content, Session],
};
