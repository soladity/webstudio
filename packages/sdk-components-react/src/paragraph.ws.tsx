import { TextAlignLeftIcon } from "@webstudio-is/icons/svg";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import { p } from "@webstudio-is/react-sdk/css-normalize";
import type { defaultTag } from "./paragraph";
import { props } from "./__generated__/paragraph.props";

const presetStyle = {
  p,
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  category: "text",
  type: "container",
  label: "Paragraph",
  icon: TextAlignLeftIcon,
  states: defaultStates,
  presetStyle,
  template: [
    {
      type: "instance",
      component: "Paragraph",
      children: [{ type: "text", value: "Paragraph you can edit" }],
    },
  ],
  order: 2,
};

export const propsMeta: WsComponentPropsMeta = {
  props,
};
