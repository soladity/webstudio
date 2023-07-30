import { RadioUncheckedIcon, RadioCheckedIcon } from "@webstudio-is/icons/svg";
import type {
  WsComponentMeta,
  WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import {
  propsCollapsible,
  propsCollapsibleContent,
  propsCollapsibleTrigger,
} from "./__generated__/collapsible.props";

export const metaCollapsible: WsComponentMeta = {
  category: "radix",
  type: "container",
  label: "Collapsible",
  icon: RadioUncheckedIcon,
  template: [
    {
      type: "instance",
      component: "Collapsible",
      props: [
        {
          name: "open",
          type: "boolean",
          value: false,
          dataSourceRef: {
            type: "variable",
            name: "collapsibleOpen",
          },
        },
        {
          name: "onOpenChange",
          type: "action",
          value: [
            {
              type: "execute",
              args: ["open"],
              code: `collapsibleOpen = open`,
            },
          ],
        },
      ],
      children: [
        {
          type: "instance",
          component: "CollapsibleTrigger",
          children: [
            {
              type: "instance",
              component: "Button",
              children: [{ type: "text", value: "Click to toggle content" }],
            },
          ],
        },
        {
          type: "instance",
          component: "CollapsibleContent",
          children: [
            {
              type: "instance",
              component: "Text",
              children: [{ type: "text", value: "Collapsible Content" }],
            },
          ],
        },
      ],
    },
  ],
};

export const metaCollapsibleTrigger: WsComponentMeta = {
  category: "hidden",
  type: "container",
  label: "Collapsible Trigger",
  icon: RadioCheckedIcon,
  stylable: false,
  detachable: false,
};

export const metaCollapsibleContent: WsComponentMeta = {
  category: "hidden",
  type: "container",
  label: "Collapsible Content",
  icon: RadioCheckedIcon,
  detachable: false,
};

export const propsMetaCollapsible: WsComponentPropsMeta = {
  props: {
    ...propsCollapsible,
    onOpenChange: {
      type: "action",
      control: "action",
      required: false,
    },
  },
  initialProps: ["open", "onOpenChange"],
};

export const propsMetaCollapsibleTrigger: WsComponentPropsMeta = {
  props: propsCollapsibleTrigger,
};

export const propsMetaCollapsibleContent: WsComponentPropsMeta = {
  props: propsCollapsibleContent,
};
