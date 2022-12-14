import { FontItalicIcon } from "@webstudio-is/icons";
import type { WsComponentMeta, MetaProps } from "./component-type";
import props from "./__generated__/italic.props.json";

const presetStyle = {
  fontStyle: {
    type: "keyword",
    value: "italic",
  },
} as const;

const meta: WsComponentMeta = {
  type: "rich-text-child",
  label: "Italic Text",
  Icon: FontItalicIcon,
  presetStyle,
  props: props as MetaProps,
};

export default meta;
