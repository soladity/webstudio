import { BodyIcon } from "@webstudio-is/icons/svg";
import { body } from "../css/normalize";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "./component-meta";
import { props } from "./__generated__/body.props";
import type { defaultTag } from "./body";

const presetStyle = {
  body: [
    ...body,

    {
      property: "minHeight",
      value: { type: "unit", unit: "%", value: 100 },
    },
    {
      property: "fontFamily",
      value: { type: "keyword", value: "Arial" },
    },
    {
      property: "fontSize",
      value: { type: "unit", unit: "px", value: 14 },
    },
    {
      property: "lineHeight",
      value: { type: "unit", unit: "number", value: 1.5 },
    },
    // temporary set root color
    // until builder start to fallback "inherit" to black
    {
      property: "color",
      value: { type: "keyword", value: "black" },
    },
  ],
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  type: "container",
  label: "Body",
  icon: BodyIcon,
  states: defaultStates,
  presetStyle,
};

export const propsMeta: WsComponentPropsMeta = {
  props,
};
