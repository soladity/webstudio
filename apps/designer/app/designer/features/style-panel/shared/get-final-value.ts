import {
  Style,
  StyleValue,
  StyleProperty,
  toValue,
  InvalidValue,
} from "@webstudio-is/react-sdk";
import type { InheritedStyle } from "./get-inherited-style";
import { isValid } from "./parse-css-value";

// @todo expose which instance we inherited the value from
export const getFinalValue = ({
  currentStyle,
  inheritedStyle,
  property,
}: {
  currentStyle: Style;
  inheritedStyle: InheritedStyle;
  property: StyleProperty;
}): StyleValue | undefined => {
  const currentValue = currentStyle[property];
  const inheritedValue =
    property in inheritedStyle ? inheritedStyle[property].value : undefined;
  if (currentValue?.value === "inherit" && inheritedValue !== undefined) {
    return inheritedValue;
  }
  if (
    currentValue &&
    currentValue.type === "unit" &&
    isValid(
      property,
      toValue({ ...currentValue, value: Math.abs(currentValue.value) })
    ) === false
  ) {
    return { ...(currentValue as unknown as InvalidValue), type: "invalid" };
  }
  return currentValue;
};
