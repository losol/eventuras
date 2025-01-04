import { Field } from "payload";
import { Content } from "@/blocks/Content/config";
import { Archive } from "@/blocks/ArchiveBlock/config";
import { Banner } from "@/blocks/Banner/config";
import { CallToAction } from "@/blocks/CallToAction/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { Code } from "@/blocks/Code/config";

export const story: Field = {
  name: 'story',
  label: 'Story',
  type: 'blocks',
  blocks: [Archive, Banner, CallToAction, Code, Content, MediaBlock],
};
