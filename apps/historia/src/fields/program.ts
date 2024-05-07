import { Field } from "payload/types";
import { Content } from "../blocks/content";
import { Session } from "../blocks/session";

export const program: Field = {
  name: 'program',
  label: 'Program',
  type: 'blocks',
  blocks: [Content, Session],
};
