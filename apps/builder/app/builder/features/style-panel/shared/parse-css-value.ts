import * as csstree from "css-tree";
import hyphenate from "hyphenate-style-name";
import type { StyleProperty, StyleValue, Unit } from "@webstudio-is/css-data";
import { units, keywordValues } from "@webstudio-is/css-data";
import warnOnce from "warn-once";

const cssTryParseValue = (input: string) => {
  try {
    const ast = csstree.parse(input, { context: "value" });
    return ast;
  } catch {
    return undefined;
  }
};

export const isValid = (property: string, value: string): boolean => {
  const ast = cssTryParseValue(value);

  if (ast == null) {
    return false;
  }

  const cssPropertyName = hyphenate(property);

  const matchResult = csstree.lexer.matchProperty(cssPropertyName, ast);

  const isValid = matchResult.matched != null;

  // @todo remove after fix https://github.com/csstree/csstree/issues/246
  if (isValid && typeof CSSStyleValue !== "undefined") {
    try {
      CSSStyleValue.parse(cssPropertyName, value);
    } catch {
      warnOnce(
        true,
        `Css property "${property}" with value "${value}" is invalid according to CSSStyleValue.parse
          but valid according to csstree.lexer.matchProperty.`
      );
      return false;
    }
  }

  return isValid;
};

export const parseCssValue = (
  property: StyleProperty,
  input: string
): StyleValue => {
  const invalidValue = {
    type: "invalid",
    value: input,
  } as const;

  if (input.length === 0) {
    return invalidValue;
  }

  if (!isValid(property, input)) {
    return invalidValue;
  }

  const ast = cssTryParseValue(input);

  if (ast == null) {
    warnOnce(
      true,
      `Can't parse css property "${property}" with value "${input}"`
    );
    return invalidValue;
  }

  if (
    ast != null &&
    ast.type === "Value" &&
    ast.children.first === ast.children.last
  ) {
    // Try extract units from 1st children
    const first = ast.children.first;

    if (first?.type === "Number") {
      return {
        type: "unit",
        unit: "number",
        value: Number(first.value),
      };
    }

    if (first?.type === "Dimension") {
      const unit = first.unit as typeof units[keyof typeof units][number];

      for (const unitGroup of Object.values(units)) {
        if (unitGroup.includes(unit as never)) {
          return {
            type: "unit",
            unit: unit as Unit,
            value: Number(first.value),
          };
        }
      }
      return invalidValue;
    }

    if (first?.type === "Percentage") {
      return {
        type: "unit",
        unit: "%",
        value: Number(first.value),
      };
    }

    if (first?.type === "Identifier") {
      const values = keywordValues[
        property as keyof typeof keywordValues
      ] as ReadonlyArray<string>;
      if (values?.includes(input)) {
        return {
          type: "keyword",
          value: input,
        };
      }
    }
  }

  return {
    type: "unparsed",
    value: input,
  };
};
