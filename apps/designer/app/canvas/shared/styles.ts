import store from "immerhin";
import { useSubscribe } from "~/shared/pubsub";
import { setInstanceStyleMutable } from "~/shared/tree-utils";
import { useSelectedInstance } from "./nano-states";
import { rootInstanceContainer } from "~/shared/nano-states";
import {
  validStaticValueTypes,
  idAttribute,
  type Breakpoint,
  type ValidStaticStyleValue,
  type StyleValue,
  type CssRule,
  type StyleProperty,
  type Style,
} from "@webstudio-is/react-sdk";
import { useEffect } from "react";
import {
  createCssEngine,
  toValue,
  type CssEngine,
  type StyleRule,
  type PlaintextRule,
} from "@webstudio-is/css-engine";
import { useIsomorphicLayoutEffect } from "react-use";
import { Asset, FontAsset } from "@webstudio-is/asset-uploader";
import { FontFormat, FONT_FORMATS, getFontFaces } from "@webstudio-is/fonts";

const cssEngine = createCssEngine();

const voidElements =
  "area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr";

// Helper styles on for canvas in design mode
const helperStyles = [
  // When double clicking into an element to edit text, it should not select the word.
  `[${idAttribute}] {
    user-select: none;
  }`,
  `[${idAttribute}]:not(${voidElements}):not(body):empty {
    outline: 1px dashed #555;
    outline-offset: -1;
    padding-top: 50;
    padding-right: 50;
  }`,
  `[${idAttribute}][contenteditable], [${idAttribute}]:focus {
    outline: 0;
  }`,
  `[${idAttribute}][contenteditable] {
    box-shadow: 0 0 0px 4px rgb(36 150 255 / 20%)
  }`,
  // Text Editor wraps each line into a p, so we need to make sure there is no jump between regular rendering and editing
  `[${idAttribute}][contenteditable] p {
    margin: 0
  }`,
];

export const useManageDesignModeStyles = () => {
  useUpdateStyle();
  usePreviewStyle();
  useRemoveSsrStyles();
};

export const addGlobalRules = (
  engine: CssEngine,
  { assets = [] }: { assets?: Array<Asset> }
) => {
  // @todo we need to figure out all global resets while keeping
  // the engine aware of all of them.
  // Ideally, the user is somehow aware and in control of the reset
  engine.addPlaintextRule("html {margin: 0; height: 100%}");

  const fontAssets = assets.filter((asset) =>
    FONT_FORMATS.has(asset.format as FontFormat)
  ) as Array<FontAsset>;
  const fontFaces = getFontFaces(fontAssets);
  for (const fontFace of fontFaces) {
    engine.addFontFaceRule(fontFace);
  }
};

const globalStylesCssEngine = createCssEngine();

export const useGlobalStyles = (assets: Array<Asset>) => {
  globalStylesCssEngine.clear();

  addGlobalRules(globalStylesCssEngine, { assets });

  for (const style of helperStyles) {
    globalStylesCssEngine.addPlaintextRule(style);
  }

  if (typeof document !== "undefined") {
    globalStylesCssEngine.render();
  }
};

// Wrapps a normal StyleValue into a VarStyleValue that uses the previous style value as a fallback and allows
// to quickly pass the values over CSS variable witout rerendering the components tree.
// Results in values like this: `var(--namespace, staticValue)`
const toVarStyleWithFallback = (instanceId: string, style: Style): Style => {
  const dynamicStyle: Style = {};
  let property: StyleProperty;
  for (property in style) {
    const value = style[property];
    if (value === undefined) {
      continue;
    }
    if (value.type === "var") {
      dynamicStyle[property] = value;
      continue;
    }
    if (
      validStaticValueTypes.includes(
        value.type as typeof validStaticValueTypes[number]
      )
    ) {
      dynamicStyle[property] = {
        type: "var",
        value: toVarNamespace(instanceId, property),
        fallbacks: [value as ValidStaticStyleValue],
      };
    }
  }
  return dynamicStyle;
};

export const addMediaRules = (breakpoints: Array<Breakpoint>) => {
  for (const breakpoint of breakpoints) {
    cssEngine.addMediaRule(breakpoint.id, breakpoint);
  }
};

const wrappedRulesMap = new Map<string, StyleRule | PlaintextRule>();

const addRule = (id: string, cssRule: CssRule) => {
  const key = id + cssRule.breakpoint;
  const selectorText = `[${idAttribute}="${id}"]`;
  const rule = cssEngine.addStyleRule(selectorText, {
    ...cssRule,
    style: toVarStyleWithFallback(id, cssRule.style),
  });
  wrappedRulesMap.set(key, rule);
  return rule;
};

const getRule = (id: string, breakpoint: string) => {
  const key = id + breakpoint;
  return wrappedRulesMap.get(key);
};

export const useCssRules = ({
  id,
  cssRules,
}: {
  id: string;
  cssRules: Array<CssRule>;
}) => {
  useIsomorphicLayoutEffect(() => {
    for (const cssRule of cssRules) {
      const rule = getRule(id, cssRule.breakpoint);
      // It's the first time the rule is being used
      if (rule === undefined) {
        addRule(id, cssRule);
        continue;
      }
      // It's an update to an existing rule
      const dynamicStyle = toVarStyleWithFallback(id, cssRule.style);
      let property: StyleProperty;
      for (property in dynamicStyle) {
        rule.styleMap.set(property, dynamicStyle[property]);
      }
    }
    cssEngine.render();
  }, [id, cssRules]);
};

const toVarNamespace = (id: string, property: string) => {
  return `${property}-${id}`;
};

const setCssVar = (id: string, property: string, value?: StyleValue) => {
  const customProperty = `--${toVarNamespace(id, property)}`;
  if (value === undefined) {
    document.body.style.removeProperty(customProperty);
    return;
  }
  document.body.style.setProperty(customProperty, toValue(value));
};

const useUpdateStyle = () => {
  const [selectedInstance] = useSelectedInstance();
  useSubscribe("updateStyle", ({ id, updates, breakpoint }) => {
    // Only update styles if they match the selected instance
    // It can potentially happen that we selected a difference instance right after we changed the style in style panel.
    if (id !== selectedInstance?.id) return;

    for (const update of updates) {
      setCssVar(id, update.property, undefined);
    }

    store.createTransaction([rootInstanceContainer], (rootInstance) => {
      if (rootInstance === undefined) {
        return;
      }
      setInstanceStyleMutable(rootInstance, id, updates, breakpoint);
    });
  });
};

const usePreviewStyle = () => {
  useSubscribe("previewStyle", ({ id, updates, breakpoint }) => {
    if (getRule(id, breakpoint.id) === undefined) {
      const rule = addRule(id, { breakpoint: breakpoint.id, style: {} });
      for (const update of updates) {
        rule.styleMap.set(update.property, update.value);
      }
      cssEngine.render();
    }
    for (const update of updates) {
      setCssVar(id, update.property, update.value);
    }
  });
};

// Once we rendered the tree in editing mode, we have rendered all styles in a <style> tag.
// We keep the SSR styles just for the page on canvas to show up like it does in preview.
const useRemoveSsrStyles = () => {
  useEffect(() => {
    const link = document.head.querySelector('[data-webstudio="ssr"]');
    link?.parentElement?.removeChild(link);
  }, []);
};
