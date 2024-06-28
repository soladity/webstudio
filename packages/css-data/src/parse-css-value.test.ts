import { describe, test, expect } from "@jest/globals";
import { parseCssValue } from "./parse-css-value";

describe("Parse CSS value", () => {
  describe("number value", () => {
    test("unitless", () => {
      expect(parseCssValue("lineHeight", "10")).toEqual({
        type: "unit",
        unit: "number",
        value: 10,
      });
    });
  });

  describe("unit value", () => {
    test("with unit", () => {
      expect(parseCssValue("width", "10px")).toEqual({
        type: "unit",
        unit: "px",
        value: 10,
      });
    });

    test("empty input", () => {
      expect(parseCssValue("width", "")).toEqual({
        type: "invalid",
        value: "",
      });
    });
  });

  describe("keyword value", () => {
    test("keyword", () => {
      expect(parseCssValue("width", "auto")).toEqual({
        type: "keyword",
        value: "auto",
      });
    });

    test("keyword display block", () => {
      expect(parseCssValue("display", "block")).toEqual({
        type: "keyword",
        value: "block",
      });
    });

    test("keyword with unit", () => {
      expect(parseCssValue("width", "autopx")).toEqual({
        type: "invalid",
        value: "autopx",
      });
    });

    test("invalid", () => {
      // This will return px as a fallback unit, as number is not valid for width.
      expect(parseCssValue("width", "10")).toEqual({
        type: "invalid",
        value: "10",
      });

      // This will return number unit, as number is valid for aspectRatio.
      expect(parseCssValue("aspectRatio", "10")).toEqual({
        type: "unit",
        unit: "number",
        value: 10,
      });
    });
  });

  describe("Unparesd valid values", () => {
    test("Simple valid function values", () => {
      expect(parseCssValue("width", "calc(4px + 16em)")).toEqual({
        type: "unparsed",
        value: "calc(4px + 16em)",
      });
    });

    test("Invalid function values", () => {
      expect(parseCssValue("width", "blur(4)")).toEqual({
        type: "invalid",
        value: "blur(4)",
      });
    });
  });

  describe("Tuples", () => {
    test("backgroundPosition", () => {
      expect(parseCssValue("backgroundPosition", "left top")).toEqual({
        type: "tuple",
        value: [
          {
            type: "keyword",
            value: "left",
          },
          {
            type: "keyword",
            value: "top",
          },
        ],
      });
    });
  });

  describe("Colors", () => {
    test("Color rgba values", () => {
      expect(parseCssValue("backgroundColor", "rgba(0,0,0,0)")).toEqual({
        type: "rgb",
        alpha: 0,
        b: 0,
        g: 0,
        r: 0,
      });
    });

    test("modern format", () => {
      expect(parseCssValue("backgroundColor", "rgb(99 102 241/0.5)")).toEqual({
        type: "rgb",
        r: 99,
        g: 102,
        b: 241,
        alpha: 0.5,
      });
    });

    test("Color rgba values", () => {
      expect(parseCssValue("backgroundColor", "#00220011")).toEqual({
        type: "rgb",
        alpha: 0.07,
        b: 0,
        g: 34,
        r: 0,
      });
    });

    test("Color rgba values", () => {
      expect(parseCssValue("color", "red")).toEqual({
        type: "keyword",
        value: "red",
      });
    });
  });
});
