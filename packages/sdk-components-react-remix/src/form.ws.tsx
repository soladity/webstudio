import { FormIcon } from "@webstudio-is/icons/svg";
import { form } from "@webstudio-is/react-sdk/css-normalize";
import type {
  PresetStyle,
  WsComponentMeta,
  WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import type { defaultTag } from "./form";
import { props } from "./__generated__/form.props";

const presetStyle = {
  form: [
    ...form,
    { property: "minHeight", value: { type: "unit", unit: "px", value: 20 } },
  ],
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  category: "forms",
  type: "container",
  label: "Form",
  icon: FormIcon,
  presetStyle,
  order: 0,
  states: [
    { selector: "[data-state=error]", label: "Error" },
    { selector: "[data-state=success]", label: "Success" },
  ],
  template: [
    {
      type: "instance",
      component: "Form",
      children: [
        {
          type: "instance",
          component: "Label",
          children: [{ type: "text", value: "Name" }],
        },
        {
          type: "instance",
          component: "Input",
          props: [{ type: "string", name: "name", value: "name" }],
          children: [],
        },
        {
          type: "instance",
          component: "Label",
          children: [{ type: "text", value: "Email" }],
        },
        {
          type: "instance",
          component: "Input",
          props: [{ type: "string", name: "name", value: "email" }],
          children: [],
        },
        {
          type: "instance",
          component: "Button",
          children: [{ type: "text", value: "Submit" }],
        },
        {
          type: "instance",
          component: "SuccessMessage",
          children: [
            {
              type: "instance",
              component: "Text",
              children: [
                { type: "text", value: "Thank you for getting in touch!" },
              ],
            },
          ],
        },
        {
          type: "instance",
          component: "ErrorMessage",
          children: [
            {
              type: "instance",
              component: "Text",
              children: [
                { type: "text", value: "Sorry, something went wrong." },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["initialState"],
};
