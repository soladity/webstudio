import { detectFont } from "detect-font";
import type { StyleProperty } from "./types";
import type { Style, StyleValue, Unit } from "./schema";
import { properties } from "./properties";
import { units } from "./units";

const unitRegex = new RegExp(`${units.join("|")}`);

// @todo use a parser
const parseValue = (property: StyleProperty, value: string): StyleValue => {
  const number = parseFloat(value);
  const parsedUnit = unitRegex.exec(value);
  if (value === "rgba(0, 0, 0, 0)") value = "transparent";
  if (isNaN(number) || parsedUnit === null) {
    return {
      type: "keyword",
      value,
    };
  }

  if (number === 0) {
    return properties[property].initial;
  }

  return {
    type: "unit",
    unit: parsedUnit[0] as Unit,
    value: number,
  };
};

export const getBrowserStyle = (element?: Element): Style => {
  const browserStyle: Style = {};
  if (element === undefined) return browserStyle;
  let knownProperty: StyleProperty;
  const computedStyle = getComputedStyle(element);
  for (knownProperty in properties) {
    if (knownProperty in computedStyle === false) continue;
    // Typescript doesn't know we can access CSSStyleDeclaration properties by keys
    const computedValue = computedStyle[knownProperty as unknown as number];
    browserStyle[knownProperty] = parseValue(knownProperty, computedValue);
  }
  // We need a single font-family that is actually rendered. Computed style will return a list of potential fonts.
  browserStyle.fontFamily = {
    type: "fontFamily",
    value: [detectFont(element)],
  };
  return browserStyle;
};
