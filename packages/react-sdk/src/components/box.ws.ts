import { SquareIcon } from "@webstudio-is/icons";
import type { WsComponentMeta, WsComponentPropsMeta } from "./component-type";
import { props } from "./__generated__/box.props";

const presetStyle = {
  boxSizing: {
    type: "keyword",
    value: "border-box",
  },
} as const;

export const meta: WsComponentMeta = {
  type: "container",
  label: "Box",
  Icon: SquareIcon,
  presetStyle,
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["tag"],
};
