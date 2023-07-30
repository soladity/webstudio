import { RadioCheckedIcon } from "@webstudio-is/icons/svg";
import {
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import * as tc from "./theme/tailwind-classes";

import {
  propsDialog,
  propsDialogContent,
  propsDialogTrigger,
  propsDialogOverlay,
  propsDialogClose,
  propsDialogTitle,
  propsDialogDescription,
} from "./__generated__/radix-dialog.props";

// @todo add [data-state] to button and link
export const metaDialogTrigger: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogTrigger",
  icon: RadioCheckedIcon,
  stylable: false,
  detachable: false,
};

export const metaDialogContent: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogContent",
  icon: RadioCheckedIcon,
  detachable: false,
};

export const metaDialogOverlay: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogOverlay",
  icon: RadioCheckedIcon,
  detachable: false,
};

export const metaDialogTitle: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogTitle",
  icon: RadioCheckedIcon,
};

export const metaDialogDescription: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogDescription",
  icon: RadioCheckedIcon,
};

export const metaDialogClose: WsComponentMeta = {
  category: "hidden",
  invalidAncestors: [],
  type: "container",
  label: "DialogClose",
  icon: RadioCheckedIcon,
};

/**
 * Styles source without animations:
 * https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/ui/dialog.tsx
 *
 * Attributions
 * MIT License
 * Copyright (c) 2023 shadcn
 **/
export const metaDialog: WsComponentMeta = {
  category: "radix",
  invalidAncestors: [],
  type: "container",
  label: "Dialog",
  icon: RadioCheckedIcon,
  order: 15,
  stylable: false,
  template: [
    {
      type: "instance",
      component: "Dialog",
      label: "Dialog",
      props: [
        {
          name: "isOpen",
          // We don't have support for boolean or undefined, instead of binding on open we bind on a string
          type: "string",
          value: "initial",
          dataSourceRef: {
            type: "variable",
            name: "isOpen",
          },
        },
      ],
      children: [
        {
          type: "instance",
          component: "DialogTrigger",
          props: [],
          children: [
            {
              type: "instance",
              component: "Button",
              children: [{ type: "text", value: "Button" }],
            },
          ],
        },
        {
          type: "instance",
          component: "DialogOverlay",
          label: "Dialog Overlay",
          props: [],
          /**
           * fixed inset-0 z-50 bg-background/80 backdrop-blur-sm
           * flex
           **/
          styles: [
            tc.fixed(),
            tc.inset(0),
            tc.z(50),
            tc.bg("background", 80),
            tc.backdropBlur("sm"),
            // To allow positioning Content
            tc.flex(),
          ].flat(),
          children: [
            {
              type: "instance",
              component: "DialogContent",
              label: "Dialog Content",
              props: [],
              /**
               * fixed w-full z-50
               * grid gap-4 max-w-lg
               * m-auto
               * border bg-background p-6 shadow-lg
               **/
              styles: [
                tc.w("full"),
                tc.z(50),
                tc.flex(),
                tc.flex("col"),
                tc.gap(4),
                tc.m("auto"),
                tc.maxW("lg"),
                tc.border(),
                tc.bg("background"),
                tc.p(6),
                tc.shadow("lg"),
                tc.relative(),
              ].flat(),
              children: [
                {
                  type: "instance",
                  component: "Box",
                  label: "Dialog Header",
                  props: [],
                  styles: [tc.flex(), tc.flex("col"), tc.gap(1)].flat(),
                  children: [
                    {
                      type: "instance",
                      component: "DialogTitle",
                      label: "Dialog Title",
                      props: [],
                      /**
                       * text-lg leading-none tracking-tight
                       **/
                      styles: [
                        tc.my(0),
                        tc.leading("none"),
                        tc.text("lg"),
                        tc.tracking("tight"),
                      ].flat(),
                      children: [
                        {
                          type: "text",
                          value: "Dialog Title",
                        },
                      ],
                    },
                    {
                      type: "instance",
                      component: "DialogDescription",
                      label: "Dialog Description",
                      props: [],
                      /**
                       * text-sm text-muted-foreground
                       **/
                      styles: [
                        tc.my(0),
                        tc.text("sm"),
                        tc.text("mutedForeground"),
                      ].flat(),
                      children: [
                        {
                          type: "text",
                          value: "dialog description text you can edit",
                        },
                      ],
                    },
                  ],
                },

                {
                  type: "instance",
                  component: "Text",
                  children: [{ type: "text", value: "The text you can edit" }],
                },

                {
                  type: "instance",
                  component: "DialogClose",
                  label: "Dialog Close",
                  props: [],
                  /**
                   * absolute right-4 top-4
                   * rounded-sm opacity-70
                   * ring-offset-background
                   * hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                   * flex items-center justify-center h-4 w-4
                   **/
                  styles: [
                    tc.absolute(),
                    tc.right(4),
                    tc.top(4),
                    tc.rounded("sm"),
                    tc.opacity(70),
                    tc.flex(),
                    tc.items("center"),
                    tc.justify("center"),
                    tc.h(4),
                    tc.w(4),
                    tc.border(0),
                    tc.bg("transparent"),
                    tc.outline("none"),
                    tc.hover(tc.opacity(100)),
                    tc.focus(tc.ring("ring", 2, "background", 2)),
                  ].flat(),
                  children: [{ type: "text", value: "✕" }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const propsMetaDialog: WsComponentPropsMeta = {
  props: propsDialog,
  initialProps: ["isOpen", "modal"],
};

export const propsMetaDialogTrigger: WsComponentPropsMeta = {
  props: propsDialogTrigger,
};

export const propsMetaDialogContent: WsComponentPropsMeta = {
  props: propsDialogContent,
  initialProps: [],
};

export const propsMetaDialogOverlay: WsComponentPropsMeta = {
  props: propsDialogOverlay,
  initialProps: [],
};

export const propsMetaDialogClose: WsComponentPropsMeta = {
  props: propsDialogClose,
  initialProps: [],
};

export const propsMetaDialogTitle: WsComponentPropsMeta = {
  props: propsDialogTitle,
  initialProps: [],
};

export const propsMetaDialogDescription: WsComponentPropsMeta = {
  props: propsDialogDescription,
  initialProps: [],
};
