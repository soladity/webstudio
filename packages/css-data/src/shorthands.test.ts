import { expect, test } from "@jest/globals";
import { expandShorthands } from "./shorthands";

test("expand border", () => {
  expect(expandShorthands([["border", "1px solid red"]])).toEqual([
    ["border-top-width", "1px"],
    ["border-right-width", "1px"],
    ["border-bottom-width", "1px"],
    ["border-left-width", "1px"],
    ["border-top-style", "solid"],
    ["border-right-style", "solid"],
    ["border-bottom-style", "solid"],
    ["border-left-style", "solid"],
    ["border-top-color", "red"],
    ["border-right-color", "red"],
    ["border-bottom-color", "red"],
    ["border-left-color", "red"],
  ]);
  // logical
  expect(expandShorthands([["border-inline", "1px solid red"]])).toEqual([
    ["border-inline-start-width", "1px"],
    ["border-inline-end-width", "1px"],
    ["border-inline-start-style", "solid"],
    ["border-inline-end-style", "solid"],
    ["border-inline-start-color", "red"],
    ["border-inline-end-color", "red"],
  ]);
  expect(expandShorthands([["border-block", "1px solid red"]])).toEqual([
    ["border-block-start-width", "1px"],
    ["border-block-end-width", "1px"],
    ["border-block-start-style", "solid"],
    ["border-block-end-style", "solid"],
    ["border-block-start-color", "red"],
    ["border-block-end-color", "red"],
  ]);
});

test("expand border edges", () => {
  expect(expandShorthands([["border-top", "1px solid red"]])).toEqual([
    ["border-top-width", "1px"],
    ["border-top-style", "solid"],
    ["border-top-color", "red"],
  ]);
  expect(expandShorthands([["border-right", "1px solid red"]])).toEqual([
    ["border-right-width", "1px"],
    ["border-right-style", "solid"],
    ["border-right-color", "red"],
  ]);
  expect(expandShorthands([["border-bottom", "1px solid red"]])).toEqual([
    ["border-bottom-width", "1px"],
    ["border-bottom-style", "solid"],
    ["border-bottom-color", "red"],
  ]);
  expect(expandShorthands([["border-left", "1px solid red"]])).toEqual([
    ["border-left-width", "1px"],
    ["border-left-style", "solid"],
    ["border-left-color", "red"],
  ]);
  // logical
  expect(expandShorthands([["border-inline-start", "1px solid red"]])).toEqual([
    ["border-inline-start-width", "1px"],
    ["border-inline-start-style", "solid"],
    ["border-inline-start-color", "red"],
  ]);
  expect(expandShorthands([["border-inline-end", "1px solid red"]])).toEqual([
    ["border-inline-end-width", "1px"],
    ["border-inline-end-style", "solid"],
    ["border-inline-end-color", "red"],
  ]);
  expect(expandShorthands([["border-block-start", "1px solid red"]])).toEqual([
    ["border-block-start-width", "1px"],
    ["border-block-start-style", "solid"],
    ["border-block-start-color", "red"],
  ]);
  expect(expandShorthands([["border-block-end", "1px solid red"]])).toEqual([
    ["border-block-end-width", "1px"],
    ["border-block-end-style", "solid"],
    ["border-block-end-color", "red"],
  ]);
  // omit values
  expect(expandShorthands([["border-top", "1px"]])).toEqual([
    ["border-top-width", "1px"],
    ["border-top-style", "initial"],
    ["border-top-color", "initial"],
  ]);
  expect(expandShorthands([["border-top", "red"]])).toEqual([
    ["border-top-width", "initial"],
    ["border-top-style", "initial"],
    ["border-top-color", "red"],
  ]);
});

test("expand border types", () => {
  expect(expandShorthands([["border-width", "1px"]])).toEqual([
    ["border-top-width", "1px"],
    ["border-right-width", "1px"],
    ["border-bottom-width", "1px"],
    ["border-left-width", "1px"],
  ]);
  expect(expandShorthands([["border-style", "solid"]])).toEqual([
    ["border-top-style", "solid"],
    ["border-right-style", "solid"],
    ["border-bottom-style", "solid"],
    ["border-left-style", "solid"],
  ]);
  expect(expandShorthands([["border-color", "red"]])).toEqual([
    ["border-top-color", "red"],
    ["border-right-color", "red"],
    ["border-bottom-color", "red"],
    ["border-left-color", "red"],
  ]);
  // logical
  expect(expandShorthands([["border-inline-width", "1px"]])).toEqual([
    ["border-inline-start-width", "1px"],
    ["border-inline-end-width", "1px"],
  ]);
  expect(expandShorthands([["border-block-width", "1px"]])).toEqual([
    ["border-block-start-width", "1px"],
    ["border-block-end-width", "1px"],
  ]);
  expect(expandShorthands([["border-inline-style", "solid"]])).toEqual([
    ["border-inline-start-style", "solid"],
    ["border-inline-end-style", "solid"],
  ]);
  expect(expandShorthands([["border-block-style", "solid"]])).toEqual([
    ["border-block-start-style", "solid"],
    ["border-block-end-style", "solid"],
  ]);
  expect(expandShorthands([["border-inline-color", "red"]])).toEqual([
    ["border-inline-start-color", "red"],
    ["border-inline-end-color", "red"],
  ]);
  expect(expandShorthands([["border-block-color", "red"]])).toEqual([
    ["border-block-start-color", "red"],
    ["border-block-end-color", "red"],
  ]);
});

test("expand border-radius", () => {
  expect(expandShorthands([["border-radius", "5px"]])).toEqual([
    ["border-top-left-radius", "5px"],
    ["border-top-right-radius", "5px"],
    ["border-bottom-right-radius", "5px"],
    ["border-top-left-radius", "5px"],
  ]);
  expect(expandShorthands([["border-radius", "1px 2px 3px 4px"]])).toEqual([
    ["border-top-left-radius", "1px"],
    ["border-top-right-radius", "2px"],
    ["border-bottom-right-radius", "3px"],
    ["border-top-left-radius", "4px"],
  ]);
  expect(expandShorthands([["border-radius", "5px / 3px"]])).toEqual([
    ["border-top-left-radius", "5px 3px"],
    ["border-top-right-radius", "5px 3px"],
    ["border-bottom-right-radius", "5px 3px"],
    ["border-top-left-radius", "5px 3px"],
  ]);
  expect(expandShorthands([["border-radius", "5px 2px / 3px 4px"]])).toEqual([
    ["border-top-left-radius", "5px 3px"],
    ["border-top-right-radius", "2px 4px"],
    ["border-bottom-right-radius", "5px 3px"],
    ["border-top-left-radius", "2px 4px"],
  ]);
});

test("expand outline", () => {
  expect(expandShorthands([["outline", "1px solid red"]])).toEqual([
    ["outline-width", "1px"],
    ["outline-style", "solid"],
    ["outline-color", "red"],
  ]);
});

test("expand margin/padding", () => {
  expect(expandShorthands([["margin", "5px"]])).toEqual([
    ["margin-top", "5px"],
    ["margin-right", "5px"],
    ["margin-bottom", "5px"],
    ["margin-left", "5px"],
  ]);
  expect(expandShorthands([["margin", "1px 2px"]])).toEqual([
    ["margin-top", "1px"],
    ["margin-right", "2px"],
    ["margin-bottom", "1px"],
    ["margin-left", "2px"],
  ]);
  expect(expandShorthands([["margin", "1px 2px 3px"]])).toEqual([
    ["margin-top", "1px"],
    ["margin-right", "2px"],
    ["margin-bottom", "3px"],
    ["margin-left", "2px"],
  ]);
  expect(expandShorthands([["margin", "1px 2px 3px 4px"]])).toEqual([
    ["margin-top", "1px"],
    ["margin-right", "2px"],
    ["margin-bottom", "3px"],
    ["margin-left", "4px"],
  ]);
  expect(expandShorthands([["padding", "5px"]])).toEqual([
    ["padding-top", "5px"],
    ["padding-right", "5px"],
    ["padding-bottom", "5px"],
    ["padding-left", "5px"],
  ]);
  // logical
  expect(expandShorthands([["margin-inline", "5px"]])).toEqual([
    ["margin-inline-start", "5px"],
    ["margin-inline-end", "5px"],
  ]);
  expect(expandShorthands([["margin-inline", "1px 2px"]])).toEqual([
    ["margin-inline-start", "1px"],
    ["margin-inline-end", "2px"],
  ]);
  expect(expandShorthands([["margin-block", "5px"]])).toEqual([
    ["margin-block-start", "5px"],
    ["margin-block-end", "5px"],
  ]);
  expect(expandShorthands([["margin-block", "1px 2px"]])).toEqual([
    ["margin-block-start", "1px"],
    ["margin-block-end", "2px"],
  ]);
});

test("expand inset", () => {
  expect(expandShorthands([["inset", "5px"]])).toEqual([
    ["top", "5px"],
    ["right", "5px"],
    ["bottom", "5px"],
    ["left", "5px"],
  ]);
  expect(expandShorthands([["inset", "1px 2px"]])).toEqual([
    ["top", "1px"],
    ["right", "2px"],
    ["bottom", "1px"],
    ["left", "2px"],
  ]);
  expect(expandShorthands([["inset", "1px 2px 3px"]])).toEqual([
    ["top", "1px"],
    ["right", "2px"],
    ["bottom", "3px"],
    ["left", "2px"],
  ]);
  expect(expandShorthands([["inset", "1px 2px 3px 4px"]])).toEqual([
    ["top", "1px"],
    ["right", "2px"],
    ["bottom", "3px"],
    ["left", "4px"],
  ]);
  // logical
  expect(expandShorthands([["inset-inline", "5px"]])).toEqual([
    ["inset-inline-start", "5px"],
    ["inset-inline-end", "5px"],
  ]);
  expect(expandShorthands([["inset-inline", "1px 2px"]])).toEqual([
    ["inset-inline-start", "1px"],
    ["inset-inline-end", "2px"],
  ]);
  expect(expandShorthands([["inset-block", "5px"]])).toEqual([
    ["inset-block-start", "5px"],
    ["inset-block-end", "5px"],
  ]);
  expect(expandShorthands([["inset-block", "1px 2px"]])).toEqual([
    ["inset-block-start", "1px"],
    ["inset-block-end", "2px"],
  ]);
});

test("expand gap and grid-gap", () => {
  expect(expandShorthands([["gap", "5px"]])).toEqual([
    ["row-gap", "5px"],
    ["column-gap", "5px"],
  ]);
  expect(expandShorthands([["gap", "1px 2px"]])).toEqual([
    ["row-gap", "1px"],
    ["column-gap", "2px"],
  ]);
  expect(expandShorthands([["grid-gap", "5px"]])).toEqual([
    ["row-gap", "5px"],
    ["column-gap", "5px"],
  ]);
  // remove grid- prefix
  expect(expandShorthands([["grid-row-gap", "5px"]])).toEqual([
    ["row-gap", "5px"],
  ]);
  expect(expandShorthands([["grid-column-gap", "5px"]])).toEqual([
    ["column-gap", "5px"],
  ]);
});

test("expand border-image", () => {
  expect(
    expandShorthands([
      [
        "border-image",
        `url("/images/border.png") 27 23 / 50px 30px / 1rem round space`,
      ],
    ])
  ).toEqual([
    ["border-image-source", "url(/images/border.png)"],
    ["border-image-slice", "27 23"],
    ["border-image-width", "50px 30px"],
    ["border-image-outset", "1rem"],
    ["border-image-repeat", "round space"],
  ]);
  // shuffled
  expect(
    expandShorthands([
      [
        "border-image",
        `round space url("/images/border.png") 27 23 / 50px 30px / 1rem`,
      ],
    ])
  ).toEqual([
    ["border-image-source", "url(/images/border.png)"],
    ["border-image-slice", "27 23"],
    ["border-image-width", "50px 30px"],
    ["border-image-outset", "1rem"],
    ["border-image-repeat", "round space"],
  ]);
  // invalid extra nodes and missing syntaxes
  // can lead to infinite loop
  expect(
    expandShorthands([
      [
        "border-image",
        `url("/images/border.png") 27 23 / 50px 30px / 1rem unknown keywords`,
      ],
    ])
  ).toEqual([
    ["border-image-source", "url(/images/border.png)"],
    ["border-image-slice", "27 23"],
    ["border-image-width", "50px 30px"],
    ["border-image-outset", "1rem"],
    ["border-image-repeat", "initial"],
  ]);
  // omitted types should be initial
  expect(
    expandShorthands([["border-image", `linear-gradient(red, blue) 27`]])
  ).toEqual([
    ["border-image-source", "linear-gradient(red,blue)"],
    ["border-image-slice", "27"],
    ["border-image-width", "initial"],
    ["border-image-outset", "initial"],
    ["border-image-repeat", "initial"],
  ]);
});

test("expand place properties", () => {
  expect(
    expandShorthands([
      ["place-content", "center"],
      ["place-items", "center"],
      ["place-self", "center"],
    ])
  ).toEqual([
    ["align-content", "center"],
    ["justify-content", "center"],
    ["align-items", "center"],
    ["justify-items", "center"],
    ["align-self", "center"],
    ["justify-self", "center"],
  ]);
  expect(
    expandShorthands([
      ["place-content", "start end"],
      ["place-items", "start end"],
      ["place-self", "start end"],
    ])
  ).toEqual([
    ["align-content", "start"],
    ["justify-content", "end"],
    ["align-items", "start"],
    ["justify-items", "end"],
    ["align-self", "start"],
    ["justify-self", "end"],
  ]);
});

test.todo("animation");
test.todo("container");
test.todo("columns");
test.todo("column-rule");
test.todo("contain-intrinsic-size");
test.todo("flex");
test.todo("flex-flow");
test.todo("font");
test.todo("font-synthesis");
test.todo("font-variant");
test.todo("grid");
test.todo("grid-area");
test.todo("grid-column");
test.todo("grid-row");
test.todo("grid-template");
test.todo("list-style");
test.todo("mask");
test.todo("mask-border");
test.todo("offset");
test.todo("scroll-margin");
test.todo("scroll-padding");
test.todo("scroll-timeline");
test.todo("text-decoration");
test.todo("text-emphasis");
test.todo("transition");

test.todo("all");
test.todo("background - not used in webflow");
test.todo("background-position-x - we use shorthand");
test.todo("background-position-y - we use shorthand");
test.todo("overflow - used in webflow");
test.todo("overflow-x - we use shorthand");
test.todo("overflow-y - we use shorthand");
test.todo("text-wrap - webflow use shorthand");
test.todo("white-space");
test.todo("white-space-collapse");
test.todo("translate - are these directly mappable to transform");
test.todo("rotate");
test.todo("scale");
