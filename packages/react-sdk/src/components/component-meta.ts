import { z } from "zod";
import type { FunctionComponent } from "react";
import type { IconProps } from "@webstudio-is/icons";
import type { Style } from "@webstudio-is/css-data";
import { PropMeta } from "@webstudio-is/generate-arg-types";
import type { htmlTags as HtmlTags } from "html-tags";

type PresetStyle = Partial<Record<HtmlTags, Style>>;

// props are separated from the rest of the meta
// so they can be exported separately and potentially tree-shaken
const WsComponentPropsMeta = z.object({
  props: z.record(PropMeta),
  initialProps: z.array(z.string()).optional(),
});

export type WsComponentPropsMeta = z.infer<typeof WsComponentPropsMeta>;

export const componentCategories = [
  "general",
  "typography",
  "media",
  "forms",
] as const;

const WsComponentMeta = z.object({
  category: z.enum(componentCategories).optional(),
  // container - can accept other components with dnd
  // control - usually form controls like inputs, without children
  // embed - images, videos or other embeddable components, without children
  // rich-text - editable text component
  // rich-text-child - formatted text fragment, not listed in components list
  type: z.enum([
    "container",
    "control",
    "embed",
    "rich-text",
    "rich-text-child",
  ]),
  label: z.string(),
  Icon: z.function(),
  presetStyle: z.optional(z.any()),
  children: z.optional(z.array(z.string())),
});

export type WsComponentMeta = Omit<
  z.infer<typeof WsComponentMeta>,
  "presetStyle" | "Icon"
> & {
  presetStyle?: PresetStyle;
  Icon: FunctionComponent<IconProps>;
};
