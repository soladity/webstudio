import { useState } from "react";
import { colord, extend, type RgbaColor } from "colord";
import namesPlugin from "colord/plugins/names";
import { useDebouncedCallback } from "use-debounce";
import { RgbaColorPicker } from "react-colorful";
import type {
  InvalidValue,
  KeywordValue,
  RgbValue,
  StyleProperty,
  StyleValue,
} from "@webstudio-is/css-engine";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisableCanvasPointerEvents,
  css,
  InputField,
} from "@webstudio-is/design-system";
import { toValue } from "@webstudio-is/css-engine";
import { theme } from "@webstudio-is/design-system";
import type { StyleSource } from "./style-info";
import { CssValueInput } from "./css-value-input";
import type { IntermediateStyleValue } from "./css-value-input/css-value-input";
import { ColorThumb } from "./color-thumb";

// To support color names
extend([namesPlugin]);

const colorfulStyles = css({
  ".react-colorful__pointer": {
    width: 20,
    height: 20,
  },
});

const colorResultToRgbValue = (rgb: RgbaColor): RgbValue => {
  return {
    type: "rgb",
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    alpha: rgb.a ?? 1,
  };
};

const styleValueResolve = (
  value: RgbValue | KeywordValue,
  currentColor: RgbValue
): RgbValue | KeywordValue => {
  if (
    value.type === "keyword" &&
    value.value.toLowerCase() === "currentcolor"
  ) {
    return {
      type: "rgb",
      r: currentColor.r,
      g: currentColor.g,
      b: currentColor.b,
      alpha: currentColor.alpha,
    };
  }

  return value;
};

const styleValueToRgbaColor = (value: CssColorPickerValueInput): RgbaColor => {
  const color = colord(
    value.type === "intermediate" ? value.value : toValue(value)
  ).toRgb();

  return {
    r: color.r,
    g: color.g,
    b: color.b,
    a: color.a,
  };
};

export type CssColorPickerValueInput =
  | RgbValue
  | KeywordValue
  | IntermediateStyleValue
  | InvalidValue;

type ColorPickerProps = {
  onChange: (value: CssColorPickerValueInput | undefined) => void;
  onChangeComplete: (event: {
    value: RgbValue | KeywordValue | InvalidValue;
  }) => void;
  onHighlight: (value: StyleValue | undefined) => void;
  onAbort: () => void;
  intermediateValue: CssColorPickerValueInput | undefined;
  value: RgbValue | KeywordValue;
  currentColor: RgbValue;
  styleSource: StyleSource;
  keywords?: Array<KeywordValue>;
  property: StyleProperty;
};

export const ColorPicker = ({
  value,
  currentColor,
  intermediateValue,
  onChange,
  onChangeComplete,
  onHighlight,
  onAbort,
  styleSource,
  keywords,
  property,
}: ColorPickerProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const { enableCanvasPointerEvents, disableCanvasPointerEvents } =
    useDisableCanvasPointerEvents();

  const currentValue =
    intermediateValue ?? styleValueResolve(value, currentColor);

  const rgbValue = styleValueToRgbaColor(currentValue);

  // Change prefix color in sync with color picker, don't change during input changed
  let prefixColor = styleValueResolve(
    currentValue.type === "keyword" || currentValue.type === "rgb"
      ? currentValue
      : value,
    currentColor
  );
  // consider inherit on color same as currentColor
  if (
    property === "color" &&
    prefixColor.type === "keyword" &&
    prefixColor.value === "inherit"
  ) {
    prefixColor = {
      type: "rgb",
      r: currentColor.r,
      g: currentColor.g,
      b: currentColor.b,
      alpha: currentColor.alpha,
    };
  }

  /**
   * By default, the color can be transparent, but if the user chooses a color from the picker,
   * we must set alpha = 1 otherwise all selected colors will be transparent.
   */
  const fixColor = (color: RgbaColor) => {
    if (
      currentValue.type === "keyword" &&
      currentValue.value === "transparent"
    ) {
      color = { ...color, a: 1 };
    }
    return colorResultToRgbValue(color);
  };

  const handleOpenChange = (open: boolean) => {
    setDisplayColorPicker(open);
    if (open) {
      // Dragging over canvas iframe with CORS policies will lead to loosing events and getting stuck in mousedown state.
      disableCanvasPointerEvents();
      // User may drag outside of the color picker and that will select everything.
      document.body.style.userSelect = "none";
      return;
    }

    document.body.style.removeProperty("user-select");
    enableCanvasPointerEvents();
  };

  const parsedColor = colord(rgbValue);
  const currentHex = parsedColor.toHex();

  const onComplete = useDebouncedCallback(
    (value: RgbValue) => onChangeComplete({ value }),
    500
  );

  const prefix = (
    <Popover modal open={displayColorPicker} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        asChild
        aria-label="Open color picker"
        onClick={() => setDisplayColorPicker((shown) => !shown)}
      >
        <ColorThumb color={rgbValue} css={{ margin: theme.spacing[3] }} />
      </PopoverTrigger>
      <PopoverContent
        css={{
          display: "grid",
          padding: theme.spacing[5],
          gap: theme.spacing[5],
        }}
      >
        <RgbaColorPicker
          className={colorfulStyles.toString()}
          color={rgbValue}
          onChange={(newValue) => {
            const color = fixColor(newValue);
            onChange(color);
            // debounced
            onComplete(color);
          }}
        />
        <InputField
          key={currentHex}
          defaultValue={currentHex.slice(1)}
          onChange={(event) => {
            const value = event.target.value.trim();
            const hex = value.startsWith("#") ? value : `#${value}`;
            const color = colord(hex);
            if (color.isValid()) {
              onComplete(colorResultToRgbValue(color.toRgb()));
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <CssValueInput
      styleSource={styleSource}
      prefix={prefix}
      showSuffix={false}
      property={property}
      value={value}
      intermediateValue={intermediateValue}
      keywords={keywords}
      onChange={(styleValue) => {
        if (
          styleValue?.type === "rgb" ||
          styleValue?.type === "keyword" ||
          styleValue?.type === "intermediate" ||
          styleValue?.type === "invalid" ||
          styleValue === undefined
        ) {
          onChange(styleValue);
          return;
        }

        onChange({
          type: "intermediate",
          value: toValue(styleValue),
        });
      }}
      onHighlight={onHighlight}
      onChangeComplete={({ value }) => {
        if (value.type === "rgb" || value.type === "keyword") {
          onChangeComplete({ value });
          return;
        }
        // In case value is parsed to something wrong
        onChange({
          type: "invalid",
          value: toValue(value),
        });
      }}
      onAbort={onAbort}
    />
  );
};
