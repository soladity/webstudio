import {
  createRegularStyleSheet,
  createAtomicStyleSheet,
  type TransformValue,
} from "@webstudio-is/css-engine";
import type {
  Assets,
  Breakpoints,
  StyleSourceSelections,
  Styles,
} from "@webstudio-is/sdk";
import type { WsComponentMeta } from "../components/component-meta";
import { idAttribute } from "../props";
import { addGlobalRules } from "./global-rules";
import { getPresetStyleRules, getStyleRules } from "./style-rules";

export type CssConfig = {
  assets: Assets;
  breakpoints: Breakpoints;
  styles: Styles;
  styleSourceSelections: StyleSourceSelections;
  componentMetas: Map<string, WsComponentMeta>;
  assetBaseUrl: string;
  atomic: boolean;
};

export const createImageValueTransformer =
  (
    assets: Assets,
    { assetBaseUrl }: { assetBaseUrl: string }
  ): TransformValue =>
  (styleValue) => {
    if (styleValue.type === "image" && styleValue.value.type === "asset") {
      const asset = assets.get(styleValue.value.value);
      if (asset === undefined) {
        return { type: "keyword", value: "none" };
      }

      // @todo reuse image loaders and generate image-set
      const url = `${assetBaseUrl}${asset.name}`;

      return {
        type: "image",
        value: {
          type: "url",
          url,
        },
        hidden: styleValue.hidden,
      };
    }
  };

export const generateCss = ({
  assets,
  breakpoints,
  styles,
  styleSourceSelections,
  componentMetas,
  assetBaseUrl,
  atomic,
}: CssConfig) => {
  const classesMap = new Map<string, Array<string>>();

  const regularSheet = createRegularStyleSheet({ name: "ssr-regular" });
  const atomicSheet = atomic
    ? createAtomicStyleSheet({ name: "ssr-atomic" })
    : undefined;

  addGlobalRules(regularSheet, { assets, assetBaseUrl });

  for (const breakpoint of breakpoints.values()) {
    (atomicSheet ?? regularSheet).addMediaRule(breakpoint.id, breakpoint);
  }

  for (const [component, meta] of componentMetas) {
    const presetStyle = meta.presetStyle;
    if (presetStyle === undefined) {
      continue;
    }
    const rules = getPresetStyleRules(component, presetStyle);
    for (const [selector, style] of rules) {
      regularSheet.addStyleRule({ style }, selector);
    }
  }

  const styleRules = getStyleRules(styles, styleSourceSelections);

  const imageValueTransformer = createImageValueTransformer(assets, {
    assetBaseUrl,
  });

  for (const { breakpointId, instanceId, state, style } of styleRules) {
    if (atomicSheet) {
      const { classes } = atomicSheet.addStyleRule(
        { breakpoint: breakpointId, style },
        state,
        imageValueTransformer
      );
      classesMap.set(instanceId, [
        ...(classesMap.get(instanceId) ?? []),
        ...classes,
      ]);
      continue;
    }
    regularSheet.addStyleRule(
      { breakpoint: breakpointId, style },
      `[${idAttribute}="${instanceId}"]${state ?? ""}`,
      imageValueTransformer
    );
  }

  return {
    cssText: regularSheet.cssText + (atomicSheet?.cssText ?? ""),
    classesMap,
  };
};
