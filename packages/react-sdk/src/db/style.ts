import { z } from "zod";
import {
  type StyleProperty,
  StyleValue,
  SharedStyleValue,
  ImageValue,
} from "@webstudio-is/css-data";
import {
  type ComponentName,
  getComponentMeta,
  getComponentNames,
} from "../components";

export const PresetStylesItem = z.object({
  component: z.enum(getComponentNames() as [ComponentName]),
  // @todo can't figure out how to make property to be enum
  property: z.string() as z.ZodType<StyleProperty>,
  value: SharedStyleValue as z.ZodType<StyleValue>,
});

export type PresetStylesItem = z.infer<typeof PresetStylesItem>;

export const PresetStyles = z.array(PresetStylesItem);

export type PresetStyles = z.infer<typeof PresetStyles>;

export const findMissingPresetStyles = (
  presetStyles: PresetStyles,
  components: ComponentName[]
) => {
  const populatedComponents = new Set();
  for (const style of presetStyles) {
    populatedComponents.add(style.component);
  }
  const missingPresetStyles: PresetStyles = [];
  for (const component of components) {
    if (populatedComponents.has(component)) {
      continue;
    }
    const meta = getComponentMeta(component);
    if (meta.presetStyle === undefined) {
      continue;
    }
    for (const [property, value] of Object.entries(meta.presetStyle)) {
      missingPresetStyles.push({
        component,
        property: property as StyleProperty,
        value,
      });
    }
  }
  return missingPresetStyles;
};

const StoredImageValue = z.object({
  type: z.literal("image"),
  value: z.array(z.object({ type: z.literal("asset"), value: z.string() })),
});

export const StoredStylesItem = z.object({
  breakpointId: z.string(),
  instanceId: z.string(),
  // @todo can't figure out how to make property to be enum
  property: z.string() as z.ZodType<StyleProperty>,
  value: z.union([StoredImageValue, SharedStyleValue]),
});

export type StoredStylesItem = z.infer<typeof StoredStylesItem>;

export const StoredStyles = z.array(StoredStylesItem);

export type StoredStyles = z.infer<typeof StoredStyles>;

export const StylesItem = z.object({
  breakpointId: z.string(),
  instanceId: z.string(),
  // @todo can't figure out how to make property to be enum
  property: z.string() as z.ZodType<StyleProperty>,
  value: z.union([ImageValue, SharedStyleValue]),
});

export type StylesItem = z.infer<typeof StylesItem>;

export const Styles = z.array(StylesItem);

export type Styles = z.infer<typeof Styles>;
