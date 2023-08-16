/**
 * Quik and dirty implementation of tailwind classes conversion to webstudio styles.
 */
import type { EmbedTemplateStyleDecl } from "@webstudio-is/react-sdk";
import { theme } from "./tailwind-theme";
import {
  parseCssValue,
  parseBoxShadow,
  StyleValue,
  type StyleProperty,
} from "@webstudio-is/css-data";
import type { EvaluatedDefaultTheme } from "./radix-common-types";

export const property = (
  property: StyleProperty,
  value: string
): EmbedTemplateStyleDecl => {
  if (value.startsWith("--")) {
    return {
      property,
      value: { type: "var", value: value.slice(2), fallbacks: [] },
    };
  }
  return {
    property,
    value: { type: "unparsed", value },
  };
};

// https://github.com/tailwindlabs/tailwindcss/blob/master/src/css/preflight.css
const preflight = (): EmbedTemplateStyleDecl[] => {
  const borderColorValue = parseCssValue("color", theme("colors")["border"]);

  return [
    {
      property: "borderTopStyle",
      value: { type: "keyword", value: "solid" },
    },
    {
      property: "borderRightStyle",
      value: { type: "keyword", value: "solid" },
    },
    {
      property: "borderBottomStyle",
      value: { type: "keyword", value: "solid" },
    },
    {
      property: "borderLeftStyle",
      value: { type: "keyword", value: "solid" },
    },

    {
      property: "borderTopColor",
      value: borderColorValue,
    },
    {
      property: "borderRightColor",
      value: borderColorValue,
    },
    {
      property: "borderBottomColor",
      value: borderColorValue,
    },
    {
      property: "borderLeftColor",
      value: borderColorValue,
    },
  ];
};

export const z = (
  zIndex?: StringEnumToNumeric<keyof EvaluatedDefaultTheme["zIndex"]>
): EmbedTemplateStyleDecl[] => {
  const valueString = theme("zIndex")[zIndex ?? "auto"];
  const value = parseCssValue("zIndex", valueString);

  return [
    {
      property: "zIndex",
      value,
    },
  ];
};

export const overflow = (
  value: "hidden" | "visible" | "scroll" | "auto"
): EmbedTemplateStyleDecl[] => [
  {
    property: "overflow",
    value: { type: "keyword", value },
  },
];

export const rounded = (
  radius?: keyof EvaluatedDefaultTheme["borderRadius"]
): EmbedTemplateStyleDecl[] => {
  const valueString = theme("borderRadius")[radius ?? "DEFAULT"];
  const value = parseCssValue("borderTopWidth", valueString);

  return [
    {
      property: "borderTopLeftRadius",
      value,
    },
    {
      property: "borderTopRightRadius",
      value,
    },
    {
      property: "borderBottomRightRadius",
      value,
    },
    {
      property: "borderBottomLeftRadius",
      value,
    },
  ];
};

type StringEnumToNumeric<T extends string> = T extends `${infer Z extends
  number}`
  ? Z
  : never;

type NonNumeric<T extends string> = T extends `${infer Z extends number}`
  ? never
  : T;

export const border = (
  borderWidthOrColor?:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["borderWidth"]>
    | keyof EvaluatedDefaultTheme["colors"]
): EmbedTemplateStyleDecl[] => {
  if (
    typeof borderWidthOrColor === "number" ||
    borderWidthOrColor === undefined
  ) {
    const key = `${borderWidthOrColor ?? "DEFAULT"}` as const;

    const valueString = theme("borderWidth")?.[key] ?? "1px";

    const value = parseCssValue("borderTopWidth", valueString);
    return [
      ...preflight(),
      { property: "borderTopWidth", value },
      { property: "borderRightWidth", value },
      { property: "borderBottomWidth", value },
      { property: "borderLeftWidth", value },
    ];
  }

  const value = parseCssValue("color", theme("colors")[borderWidthOrColor]);

  return [
    {
      property: "borderTopColor",
      value,
    },
    {
      property: "borderRightColor",
      value,
    },
    {
      property: "borderBottomColor",
      value,
    },
    {
      property: "borderLeftColor",
      value,
    },
  ];
};

export const borderB = (
  borderWidthOrColor?:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["borderWidth"]>
    | keyof EvaluatedDefaultTheme["colors"]
): EmbedTemplateStyleDecl[] => {
  let widthValue: StyleValue = { type: "unit", value: 1, unit: "number" };
  let colorValue: StyleValue = parseCssValue(
    "color",
    theme("colors")["border"]
  );
  if (
    typeof borderWidthOrColor === "number" ||
    borderWidthOrColor === undefined
  ) {
    const key = `${borderWidthOrColor ?? "DEFAULT"}` as const;
    const valueString = theme("borderWidth")[key] ?? "1px";
    widthValue = parseCssValue("borderTopWidth", valueString);
  } else {
    colorValue = parseCssValue("color", theme("colors")[borderWidthOrColor]);
  }

  return [
    {
      property: "borderBottomWidth",
      value: widthValue,
    },
    {
      property: "borderBottomStyle",
      value: { type: "keyword", value: "solid" },
    },
    {
      property: "borderBottomColor",
      value: colorValue,
    },
  ];
};

const paddingProperty =
  (property: "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft") =>
  (
    padding:
      | StringEnumToNumeric<keyof EvaluatedDefaultTheme["padding"]>
      | NonNumeric<keyof EvaluatedDefaultTheme["padding"]>
  ): EmbedTemplateStyleDecl[] => {
    const key = `${padding}` as const;
    const valueString = theme("padding")?.[key] ?? "0";
    const value = parseCssValue(property, valueString);

    return [{ property, value }];
  };

export const pt: ReturnType<typeof paddingProperty> = (padding) => {
  return paddingProperty("paddingTop")(padding);
};

export const pb: ReturnType<typeof paddingProperty> = (padding) => {
  return paddingProperty("paddingBottom")(padding);
};

export const pl: ReturnType<typeof paddingProperty> = (padding) => {
  return paddingProperty("paddingLeft")(padding);
};

export const pr: ReturnType<typeof paddingProperty> = (padding) => {
  return paddingProperty("paddingRight")(padding);
};

export const px: ReturnType<typeof paddingProperty> = (padding) => {
  return [pl(padding), pr(padding)].flat();
};

export const py: ReturnType<typeof paddingProperty> = (padding) => {
  return [pt(padding), pb(padding)].flat();
};

export const p: ReturnType<typeof paddingProperty> = (padding) => {
  return [px(padding), py(padding)].flat();
};

const marginProperty =
  (property: "marginTop" | "marginRight" | "marginBottom" | "marginLeft") =>
  (
    margin:
      | StringEnumToNumeric<keyof EvaluatedDefaultTheme["margin"]>
      | NonNumeric<keyof EvaluatedDefaultTheme["margin"]>
  ): EmbedTemplateStyleDecl[] => {
    const key = `${margin}` as const;
    const valueString = theme("margin")?.[key] ?? "0";
    const value = parseCssValue(property, valueString);

    return [{ property, value }];
  };

export const ml: ReturnType<typeof marginProperty> = (margin) => {
  return marginProperty("marginLeft")(margin);
};

export const mr: ReturnType<typeof marginProperty> = (margin) => {
  return marginProperty("marginRight")(margin);
};

export const mt: ReturnType<typeof marginProperty> = (margin) => {
  return marginProperty("marginTop")(margin);
};

export const mb: ReturnType<typeof marginProperty> = (margin) => {
  return marginProperty("marginBottom")(margin);
};

export const mx: ReturnType<typeof marginProperty> = (margin) => {
  return [ml(margin), mr(margin)].flat();
};

export const my: ReturnType<typeof marginProperty> = (margin) => {
  return [mt(margin), mb(margin)].flat();
};

export const m: ReturnType<typeof marginProperty> = (margin) => {
  return [mx(margin), my(margin)].flat();
};

export const w = (
  spacing:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["width"]>
    | NonNumeric<keyof EvaluatedDefaultTheme["width"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${spacing}` as const;
  const valueString = theme("width")?.[key] ?? "0";
  const value = parseCssValue("width", valueString);

  return [{ property: "width", value }];
};

export const h = (
  spacing:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["height"]>
    | NonNumeric<keyof EvaluatedDefaultTheme["height"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${spacing}` as const;
  const valueString = theme("height")?.[key] ?? "0";
  const value = parseCssValue("height", valueString);

  return [{ property: "height", value }];
};

export const minH = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["height"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${spacing}` as const;
  const valueString = theme("height")?.[key] ?? "0";
  const value = parseCssValue("minHeight", valueString);

  return [{ property: "minHeight", value }];
};

export const opacity = (
  opacity: StringEnumToNumeric<keyof EvaluatedDefaultTheme["opacity"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${opacity}` as const;
  const valueString = theme("opacity")?.[key] ?? "0";
  const value = parseCssValue("opacity", valueString);

  return [
    {
      property: "opacity",
      value,
    },
  ];
};

export const cursor = (
  cursor: keyof EvaluatedDefaultTheme["cursor"]
): EmbedTemplateStyleDecl[] => {
  const valueString = theme("cursor")?.[cursor] ?? "auto";
  const value = parseCssValue("cursor", valueString);

  return [
    {
      property: "cursor",
      value,
    },
  ];
};

export const maxW = (
  spacing:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["maxWidth"]>
    | NonNumeric<keyof EvaluatedDefaultTheme["maxWidth"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${spacing}` as const;
  const valueString = theme("maxWidth")?.[key] ?? "0";
  const value = parseCssValue("width", valueString);

  return [{ property: "maxWidth", value }];
};

const positionStyle = (
  property: "left" | "right" | "top" | "bottom",
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl => {
  const key = `${spacing}` as const;
  const valueString = theme("spacing")?.[key] ?? "0";
  const value = parseCssValue(property, valueString);

  return { property, value };
};

export const top = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => [positionStyle("top", spacing)];

export const right = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => [positionStyle("right", spacing)];

export const bottom = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => [positionStyle("bottom", spacing)];

export const left = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => [positionStyle("left", spacing)];

export const inset = (
  spacing: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => [
  positionStyle("left", spacing),
  positionStyle("right", spacing),
  positionStyle("top", spacing),
  positionStyle("bottom", spacing),
];

export const backdropBlur = (
  blur: keyof EvaluatedDefaultTheme["blur"]
): EmbedTemplateStyleDecl[] => {
  const valueString = theme("blur")[blur];
  const value = {
    type: "unparsed" as const,
    value: `blur(${valueString})`,
  };

  return [{ property: "backdropFilter", value }];
};

export const bg = (
  color: keyof EvaluatedDefaultTheme["colors"],
  alpha?: number
): EmbedTemplateStyleDecl[] => {
  const value = parseCssValue("backgroundColor", theme("colors")[color]);

  if (alpha !== undefined && value.type === "rgb") {
    value.alpha = alpha / 100;
  }

  return [
    {
      property: "backgroundColor",
      value,
    },
  ];
};

export const fixed = (): EmbedTemplateStyleDecl[] => {
  return [{ property: "position", value: { type: "keyword", value: "fixed" } }];
};

export const relative = (): EmbedTemplateStyleDecl[] => {
  return [
    { property: "position", value: { type: "keyword", value: "relative" } },
  ];
};

export const absolute = (): EmbedTemplateStyleDecl[] => {
  return [
    { property: "position", value: { type: "keyword", value: "absolute" } },
  ];
};

export const grid = (): EmbedTemplateStyleDecl[] => {
  return [{ property: "display", value: { type: "keyword", value: "grid" } }];
};

const alignItems = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
} as const;
type AlignItems = keyof typeof alignItems;

export const items = (
  alignItemsParam: AlignItems
): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "alignItems",
      value: {
        type: "keyword",
        value: alignItems[alignItemsParam],
      },
    },
  ];
};

const justifyContent = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  stretch: "stretch",
} as const;
type JustifyContent = keyof typeof justifyContent;

export const justify = (
  justifyContentParam: JustifyContent
): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "justifyContent",
      value: {
        type: "keyword",
        value: justifyContent[justifyContentParam],
      },
    },
  ];
};

export const inlineFlex = (): EmbedTemplateStyleDecl[] => {
  return [
    { property: "display", value: { type: "keyword", value: "inline-flex" } },
  ];
};

const flexDirection = { row: "row", col: "column" } as const;
type FlexDirection = keyof typeof flexDirection;

type FlexSizing = 1 | "auto" | "initial" | "none";

export const flex = (
  flexParam?: FlexDirection | FlexSizing
): EmbedTemplateStyleDecl[] => {
  if (flexParam === undefined) {
    return [{ property: "display", value: { type: "keyword", value: "flex" } }];
  }

  if (flexParam === 1) {
    return [
      {
        property: "flexGrow",
        value: { type: "unit", value: 1, unit: "number" },
      },
      {
        property: "flexShrink",
        value: { type: "unit", value: 1, unit: "number" },
      },
      {
        property: "flexBasis",
        value: { type: "unit", value: 0, unit: "%" },
      },
    ];
  }

  if (flexParam === "auto") {
    return [
      {
        property: "flexGrow",
        value: { type: "unit", value: 1, unit: "number" },
      },
      {
        property: "flexShrink",
        value: { type: "unit", value: 1, unit: "number" },
      },
      {
        property: "flexBasis",
        value: { type: "keyword", value: "auto" },
      },
    ];
  }

  if (flexParam === "initial") {
    return [
      {
        property: "flexGrow",
        value: { type: "unit", value: 0, unit: "number" },
      },
      {
        property: "flexShrink",
        value: { type: "unit", value: 1, unit: "number" },
      },
      {
        property: "flexBasis",
        value: { type: "keyword", value: "auto" },
      },
    ];
  }

  if (flexParam === "none") {
    return [
      {
        property: "flexGrow",
        value: { type: "unit", value: 0, unit: "number" },
      },
      {
        property: "flexShrink",
        value: { type: "unit", value: 0, unit: "number" },
      },
      {
        property: "flexBasis",
        value: { type: "keyword", value: "auto" },
      },
    ];
  }

  return [
    {
      property: "flexDirection",
      value: {
        type: "keyword",
        value: flexDirection[flexParam],
      },
    },
  ];
};

export const grow = (): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "flexGrow",
      value: { type: "unit", value: 1, unit: "number" },
    },
  ];
};

export const shrink = (value: number): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "flexGrow",
      value: { type: "unit", value, unit: "number" },
    },
  ];
};

export const gap = (
  gapValue: StringEnumToNumeric<keyof EvaluatedDefaultTheme["spacing"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${gapValue}` as const;
  const valueString = theme("spacing")?.[key] ?? "0";
  const value = parseCssValue("rowGap", valueString);

  return [
    { property: "rowGap", value },
    { property: "columnGap", value },
  ];
};

export const leading = (
  lineHeight:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["lineHeight"]>
    | NonNumeric<keyof EvaluatedDefaultTheme["lineHeight"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${lineHeight}` as const;
  const valueString = theme("lineHeight")[key];
  const value = parseCssValue("lineHeight", valueString);

  return [{ property: "lineHeight", value }];
};

export const tracking = (
  letterSpacing:
    | StringEnumToNumeric<keyof EvaluatedDefaultTheme["letterSpacing"]>
    | NonNumeric<keyof EvaluatedDefaultTheme["letterSpacing"]>
): EmbedTemplateStyleDecl[] => {
  const key = `${letterSpacing}` as const;
  const valueString = theme("letterSpacing")[key];
  const value = parseCssValue("letterSpacing", valueString);

  return [{ property: "letterSpacing", value }];
};

export const outline = (value: "none"): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "outlineWidth",
      value: { type: "unit", value: 2, unit: "px" },
    },
    {
      property: "outlineStyle",
      value: { type: "keyword", value: "solid" },
    },
    {
      property: "outlineColor",
      value: { type: "keyword", value: "transparent" },
    },
    {
      property: "outlineOffset",
      value: { type: "unit", value: 2, unit: "px" },
    },
  ];
};

const textSizes = [
  "sm",
  "base",
  "lg",
  "xs",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
] as const satisfies readonly (keyof EvaluatedDefaultTheme["fontSize"])[];
type TextSize = keyof EvaluatedDefaultTheme["fontSize"];

const isTextSize = (value: string): value is TextSize =>
  textSizes.includes(value as TextSize);

export const text = (
  sizeOrColor: TextSize | keyof EvaluatedDefaultTheme["colors"]
): EmbedTemplateStyleDecl[] => {
  if (isTextSize(sizeOrColor)) {
    const valueArr = theme("fontSize")[sizeOrColor];
    const [fontSizeString, { lineHeight: lineHeightString }] = valueArr;

    const fontSize = parseCssValue("fontSize", fontSizeString);
    const lineHeight = parseCssValue("lineHeight", lineHeightString);
    return [
      { property: "fontSize", value: fontSize },
      { property: "lineHeight", value: lineHeight },
    ];
  }

  const value = parseCssValue("color", theme("colors")[sizeOrColor]);

  return [
    {
      property: "color",
      value,
    },
  ];
};

export const underline = (): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "textDecorationLine",
      value: { type: "keyword", value: "underline" },
    },
  ];
};

export const underlineOffset = (
  offset: StringEnumToNumeric<
    keyof EvaluatedDefaultTheme["textUnderlineOffset"]
  >
): EmbedTemplateStyleDecl[] => {
  const key = `${offset}` as const;
  const valueString = theme("textUnderlineOffset")[key];
  const value = parseCssValue("textUnderlineOffset", valueString);

  return [
    {
      property: "textUnderlineOffset",
      value,
    },
  ];
};

const weights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const font = (
  weight:
    | "thin"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black"
): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "fontWeight",
      value: { type: "keyword", value: weights[weight] },
    },
  ];
};

export const whitespace = (
  value: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "break-spaces"
): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "whiteSpace",
      value: { type: "keyword", value },
    },
  ];
};

export const shadow = (
  shadowSize: keyof EvaluatedDefaultTheme["boxShadow"]
): EmbedTemplateStyleDecl[] => {
  const valueString = theme("boxShadow")[shadowSize];
  const value = parseBoxShadow(valueString);

  return [
    {
      property: "boxShadow",
      value,
    },
  ];
};

export const ring = (
  ringColor: keyof EvaluatedDefaultTheme["colors"],
  ringWidth: StringEnumToNumeric<keyof EvaluatedDefaultTheme["ringWidth"]>,
  ringOffsetColor: keyof EvaluatedDefaultTheme["colors"] = "background",
  ringOffsetWidth: StringEnumToNumeric<
    keyof EvaluatedDefaultTheme["ringOffsetWidth"]
  > = 0,
  inset: "inset" | "" = ""
): EmbedTemplateStyleDecl[] => {
  const ringWidthUnits = theme("ringWidth")[ringWidth];
  const ringOffsetWidthUnits = theme("ringOffsetWidth")[ringOffsetWidth];
  const ringColorRgb = theme("colors")[ringColor];
  const ringOffsetColorRgb = theme("colors")[ringOffsetColor];
  const ringOffsetShadow = `${inset} 0 0 0 ${ringOffsetWidthUnits} ${ringOffsetColorRgb}`;

  const ringWidthParsed = parseFloat(ringWidthUnits);
  const ringOffsetWidthParsed = parseFloat(ringOffsetWidthUnits);

  const ringShadow = `${inset} 0 0 0 ${
    ringWidthParsed + ringOffsetWidthParsed
  }px ${ringColorRgb}`;

  const value = parseBoxShadow(`${ringOffsetShadow}, ${ringShadow}`);

  return [
    {
      property: "boxShadow",
      value,
    },
  ];
};

export const pointerEvents = (
  value: "none" | "auto"
): EmbedTemplateStyleDecl[] => {
  return [{ property: "pointerEvents", value: { type: "keyword", value } }];
};

export const transition = (
  value: "none" | "all" | "transform"
): EmbedTemplateStyleDecl[] => {
  if (value === "none") {
    return [
      {
        property: "transitionProperty",
        value: { type: "keyword", value: "all" },
      },
    ];
  }
  return [
    {
      property: "transitionProperty",
      value: { type: "keyword", value },
    },
    {
      property: "transitionTimingFunction",
      value: { type: "unparsed", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
    },
    {
      property: "transitionDuration",
      value: { type: "unparsed", value: "150ms" },
    },
  ];
};

export const duration = (ms: number): EmbedTemplateStyleDecl[] => {
  return [
    {
      property: "transitionDuration",
      value: { type: "unit", value: ms, unit: "ms" },
    },
  ];
};

export const hover = (
  value: EmbedTemplateStyleDecl[]
): EmbedTemplateStyleDecl[] => {
  return value.map((decl) => ({
    ...decl,
    state: ":hover",
  }));
};

export const focus = (
  value: EmbedTemplateStyleDecl[]
): EmbedTemplateStyleDecl[] => {
  return value.map((decl) => ({
    ...decl,
    state: ":focus",
  }));
};

export const focusVisible = (
  value: EmbedTemplateStyleDecl[]
): EmbedTemplateStyleDecl[] => {
  return value.map((decl) => ({
    ...decl,
    state: ":focus-visible",
  }));
};

export const disabled = (
  value: EmbedTemplateStyleDecl[]
): EmbedTemplateStyleDecl[] => {
  return value.map((decl) => ({
    ...decl,
    state: ":disabled",
  }));
};

export const state = (
  value: EmbedTemplateStyleDecl[],
  state: string
): EmbedTemplateStyleDecl[] => {
  return value.map((decl) => ({
    ...decl,
    state,
  }));
};
