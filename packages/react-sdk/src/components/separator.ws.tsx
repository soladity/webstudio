import { DashIcon } from "@webstudio-is/icons";
import type { WsComponentMeta, WsComponentPropsMeta } from "./component-type";
import props from "./__generated__/blockquote.props.json";

const presetStyle = {
  height: {
    type: "keyword",
    value: "1px",
  },
  backgroundColor: {
    type: "keyword",
    value: "gray",
  },
  border: {
    type: "keyword",
    value: "none",
  },
} as const;

export const meta: WsComponentMeta = {
  type: "embed",
  label: "Separator",
  Icon: DashIcon,
  presetStyle,
  children: [],
};

export const propsMeta = {
  props,
  initialProps: [],
} as WsComponentPropsMeta;
