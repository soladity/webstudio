import { beforeEach, describe, expect, test } from "@jest/globals";
import { setEnv } from "@webstudio-is/feature-flags";
import {
  toValue,
  type StyleProperty,
  type StyleValue,
} from "@webstudio-is/css-engine";
import { parseCssValue } from "@webstudio-is/css-data";
import {
  addRepeatedStyleItem,
  deleteRepeatedStyleItem,
  editRepeatedStyleItem,
  getRepeatedStyleItem,
  setRepeatedStyleItem,
  swapRepeatedStyleItems,
  toggleRepeatedStyleItem,
} from "./repeated-style";
import { createComputedStyleDeclStore } from "./model";
import { parseCssFragment } from "./css-fragment";
import {
  $breakpoints,
  $selectedBreakpointId,
  $selectedInstanceSelector,
  $styles,
  $styleSources,
  $styleSourceSelections,
} from "~/shared/nano-states";
import { registerContainers } from "~/shared/sync";
import { setProperty } from "./use-style-data";
import type { ComputedStyleDecl } from "~/shared/style-object-model";

setEnv("*");
registerContainers();

beforeEach(() => {
  $breakpoints.set(new Map([["base", { id: "base", label: "" }]]));
  $selectedBreakpointId.set("base");
  $selectedInstanceSelector.set(["box"]);
  $styleSourceSelections.set(new Map());
  $styleSources.set(new Map());
  $styles.set(new Map());
});

const setRawProperty = (property: StyleProperty, value: string) => {
  setProperty(property)(parseCssValue(property, value));
};

test("get repeated style item by index", () => {
  const cascadedValue: StyleValue = {
    type: "layers",
    value: [
      { type: "keyword", value: "red" },
      { type: "keyword", value: "green" },
      { type: "keyword", value: "blue" },
    ],
  };
  const styleDecl: ComputedStyleDecl = {
    property: "color",
    source: {
      name: "default",
    },
    cascadedValue,
    computedValue: cascadedValue,
    usedValue: cascadedValue,
  };
  expect(getRepeatedStyleItem(styleDecl, 0)).toEqual({
    type: "keyword",
    value: "red",
  });
  expect(getRepeatedStyleItem(styleDecl, 1)).toEqual({
    type: "keyword",
    value: "green",
  });
  expect(getRepeatedStyleItem(styleDecl, 2)).toEqual({
    type: "keyword",
    value: "blue",
  });
  // repeat values
  expect(getRepeatedStyleItem(styleDecl, 3)).toEqual({
    type: "keyword",
    value: "red",
  });
  expect(getRepeatedStyleItem(styleDecl, 4)).toEqual({
    type: "keyword",
    value: "green",
  });
  expect(getRepeatedStyleItem(styleDecl, 5)).toEqual({
    type: "keyword",
    value: "blue",
  });
});

describe("add repeated item", () => {
  test("add layer to var", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "var(--my-property)");
    expect($transitionProperty.get().cascadedValue.type).toEqual("var");
    addRepeatedStyleItem(
      [$transitionProperty.get()],
      parseCssFragment("opacity", ["transitionProperty"])
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "var(--my-property), opacity"
    );
  });

  test("add layer to repeated style", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    addRepeatedStyleItem(
      [$transitionProperty.get()],
      parseCssFragment("opacity", ["transitionProperty"])
    );
    addRepeatedStyleItem(
      [$transitionProperty.get()],
      parseCssFragment("transform", ["transitionProperty"])
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "opacity, transform"
    );
  });

  test("add tuple to repeated style", () => {
    const $filter = createComputedStyleDeclStore("filter");
    addRepeatedStyleItem(
      [$filter.get()],
      parseCssFragment("blur(5px)", ["filter"])
    );
    addRepeatedStyleItem(
      [$filter.get()],
      parseCssFragment("brightness(0.5)", ["filter"])
    );
    expect(toValue($filter.get().cascadedValue)).toEqual(
      "blur(5px) brightness(0.5)"
    );
  });

  test("ignore when new item is not layers or tuple", () => {
    const $backgroundColor = createComputedStyleDeclStore("backgroundColor");
    addRepeatedStyleItem(
      [$backgroundColor.get()],
      parseCssFragment("none", ["background"])
    );
    expect($backgroundColor.get().source.name).toEqual("default");
    expect(toValue($backgroundColor.get().cascadedValue)).toEqual(
      "transparent"
    );
  });

  test("align properties with primary property", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    const $transitionDuration =
      createComputedStyleDeclStore("transitionDuration");
    const $transitionDelay = createComputedStyleDeclStore("transitionDelay");
    setRawProperty("transitionProperty", "opacity, transform");
    setRawProperty("transitionDuration", "1s");
    addRepeatedStyleItem(
      [
        $transitionProperty.get(),
        $transitionDuration.get(),
        $transitionDelay.get(),
      ],
      parseCssFragment("width 2s", ["transition"])
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "opacity, transform, width"
    );
    expect(toValue($transitionDuration.get().cascadedValue)).toEqual(
      "1s, 1s, 2s"
    );
    expect(toValue($transitionDelay.get().cascadedValue)).toEqual("0s, 0s, 0s");
  });
});

describe("edit item in repeated style", () => {
  test("edit single variable", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    setRawProperty("backgroundImage", "none");
    editRepeatedStyleItem(
      [$backgroundImage.get()],
      0,
      parseCssFragment("var(--gradient1)", ["backgroundImage"])
    );
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual(
      "var(--gradient1)"
    );
    expect($backgroundImage.get().cascadedValue.type).toEqual("var");
    editRepeatedStyleItem(
      [$backgroundImage.get()],
      // use greater index when access computed items
      2,
      parseCssFragment("var(--gradient2)", ["backgroundImage"])
    );
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual(
      "var(--gradient2)"
    );
    expect($backgroundImage.get().cascadedValue.type).toEqual("var");
  });

  test("edit variable in multiple layers", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    setRawProperty("backgroundImage", "none, none");
    editRepeatedStyleItem(
      [$backgroundImage.get()],
      1,
      parseCssFragment("var(--gradient1)", ["backgroundImage"])
    );
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual(
      "none, var(--gradient1)"
    );
    expect($backgroundImage.get().cascadedValue.type).toEqual("layers");
    editRepeatedStyleItem(
      [$backgroundImage.get()],
      1,
      parseCssFragment("var(--gradient2)", ["backgroundImage"])
    );
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual(
      "none, var(--gradient2)"
    );
    expect($backgroundImage.get().cascadedValue.type).toEqual("layers");
  });

  test("edit layer", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "opacity, transform");
    editRepeatedStyleItem(
      [$transitionProperty.get()],
      1,
      parseCssFragment("width", ["transitionProperty"])
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "opacity, width"
    );
  });

  test("edit tuple", () => {
    const $filter = createComputedStyleDeclStore("filter");
    setRawProperty("filter", "blur(5px) brightness(0.5)");
    editRepeatedStyleItem(
      [$filter.get()],
      1,
      parseCssFragment("contrast(200%)", ["filter"])
    );
    expect(toValue($filter.get().cascadedValue)).toEqual(
      "blur(5px) contrast(200%)"
    );
  });
});

test("set layers item into repeated style", () => {
  const $transitionProperty =
    createComputedStyleDeclStore("transitionProperty");
  setRawProperty("transitionProperty", "opacity, transform");
  setRepeatedStyleItem($transitionProperty.get(), 0, {
    type: "unparsed",
    value: "width",
  });
  expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
    "width, transform"
  );
  // out of bounds will repeat existing values
  setRepeatedStyleItem($transitionProperty.get(), 3, {
    type: "unparsed",
    value: "left",
  });
  expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
    "width, transform, width, left"
  );
});

test("unpack item from layers value in repeated style", () => {
  const $transitionProperty =
    createComputedStyleDeclStore("transitionProperty");
  setRawProperty("transitionProperty", "opacity, transform");
  setRepeatedStyleItem($transitionProperty.get(), 1, {
    type: "layers",
    value: [{ type: "unparsed", value: "width" }],
  });
  expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
    "opacity, width"
  );
});

describe("delete repeated item", () => {
  test("delete var or other not releated value in repeated style", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    // var()
    setRawProperty("backgroundImage", "var(--my-bg)");
    deleteRepeatedStyleItem([$backgroundImage.get()], 0);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual("none");
    // inherit
    setRawProperty("backgroundImage", "inherit");
    deleteRepeatedStyleItem([$backgroundImage.get()], 0);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual("none");
  });

  test("convert to var when it is the only left in repeated style", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    // var()
    setRawProperty("backgroundImage", "var(--bg1), var(--bg2)");
    deleteRepeatedStyleItem([$backgroundImage.get()], 1);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual("var(--bg1)");
    expect($backgroundImage.get().cascadedValue.type).toEqual("var");
  });

  test("delete layer from repeated style", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "opacity, transform");
    deleteRepeatedStyleItem([$transitionProperty.get()], 0);
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "transform"
    );
  });

  test("delete value without layers from repeated style", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "opacity");
    expect($transitionProperty.get().source.name).toEqual("local");
    deleteRepeatedStyleItem([$transitionProperty.get()], 0);
    expect($transitionProperty.get().source.name).toEqual("default");
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual("all");
  });

  test("align layers with primary when toggling toggle", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    const $transitionDuration =
      createComputedStyleDeclStore("transitionDuration");
    setRawProperty("transitionProperty", "opacity, transform, color");
    setRawProperty("transitionDuration", "1s, 2s");
    deleteRepeatedStyleItem(
      [$transitionProperty.get(), $transitionDuration.get()],
      0
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "transform, color"
    );
    // color should not switch to 1s when hide first layer
    expect(toValue($transitionDuration.get().cascadedValue)).toEqual("2s, 1s");
  });

  test("delete tuple from repeated style", () => {
    const $filter = createComputedStyleDeclStore("filter");
    setRawProperty("filter", "blur(5px) brightness(0.5)");
    deleteRepeatedStyleItem([$filter.get()], 0);
    expect(toValue($filter.get().cascadedValue)).toEqual("brightness(0.5)");
  });
});

describe("toggle repeated item", () => {
  test("toggle var in repeated style", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    setRawProperty("backgroundImage", "var(--my-bg)");
    toggleRepeatedStyleItem([$backgroundImage.get()], 0);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual("");
    toggleRepeatedStyleItem([$backgroundImage.get()], 0);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual(
      "var(--my-bg)"
    );
  });

  test("ignore toggling not repeated value in repeated style", () => {
    const $backgroundImage = createComputedStyleDeclStore("backgroundImage");
    setRawProperty("backgroundImage", "inherit");
    toggleRepeatedStyleItem([$backgroundImage.get()], 0);
    expect(toValue($backgroundImage.get().cascadedValue)).toEqual("inherit");
  });

  test("toggle layer in repeated style", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "opacity, transform");
    toggleRepeatedStyleItem([$transitionProperty.get()], 0);
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "transform"
    );
    toggleRepeatedStyleItem([$transitionProperty.get()], 0);
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "opacity, transform"
    );
  });

  test("toggle tuple in repeated style", () => {
    const $filter = createComputedStyleDeclStore("filter");
    setRawProperty("filter", "blur(5px) brightness(0.5)");
    toggleRepeatedStyleItem([$filter.get()], 0);
    expect(toValue($filter.get().cascadedValue)).toEqual("brightness(0.5)");
    toggleRepeatedStyleItem([$filter.get()], 0);
    expect(toValue($filter.get().cascadedValue)).toEqual(
      "blur(5px) brightness(0.5)"
    );
  });

  test("align layers with primary when toggling toggle", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    const $transitionDuration =
      createComputedStyleDeclStore("transitionDuration");
    setRawProperty("transitionProperty", "opacity, transform, color");
    setRawProperty("transitionDuration", "1s, 2s");
    toggleRepeatedStyleItem(
      [$transitionProperty.get(), $transitionDuration.get()],
      0
    );
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "transform, color"
    );
    // color should not switch to 1s when hide first layer
    expect(toValue($transitionDuration.get().cascadedValue)).toEqual("2s, 1s");
  });
});

describe("swap repeated items", () => {
  test("swap layers in repeated style", () => {
    const $transitionProperty =
      createComputedStyleDeclStore("transitionProperty");
    setRawProperty("transitionProperty", "opacity, transform");
    swapRepeatedStyleItems([$transitionProperty.get()], 0, 1);
    expect(toValue($transitionProperty.get().cascadedValue)).toEqual(
      "transform, opacity"
    );
  });

  test("add tuple items in repeated style", () => {
    const $filter = createComputedStyleDeclStore("filter");
    setRawProperty("filter", "blur(5px) brightness(0.5)");
    swapRepeatedStyleItems([$filter.get()], 0, 1);
    expect(toValue($filter.get().cascadedValue)).toEqual(
      "brightness(0.5) blur(5px)"
    );
  });
});
