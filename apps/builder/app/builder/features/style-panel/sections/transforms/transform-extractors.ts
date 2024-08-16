import type {
  FunctionValue,
  KeywordValue,
  StyleValue,
  TupleValue,
  UnitValue,
} from "@webstudio-is/css-engine";

export const extractRotatePropertiesFromTransform = (transform: StyleValue) => {
  let rotateX: FunctionValue | undefined;
  let rotateY: FunctionValue | undefined;
  let rotateZ: FunctionValue | undefined;

  if (transform.type !== "tuple") {
    return { rotateX, rotateY, rotateZ };
  }

  for (const item of transform.value) {
    if (item.type === "function" && item.name === "rotateX") {
      rotateX = item;
    }

    if (item.type === "function" && item.name === "rotateY") {
      rotateY = item;
    }

    if (item.type === "function" && item.name === "rotateZ") {
      rotateZ = item;
    }
  }

  return { rotateX, rotateY, rotateZ };
};

export const extractSkewPropertiesFromTransform = (skew: StyleValue) => {
  let skewX: FunctionValue | undefined = undefined;
  let skewY: FunctionValue | undefined = undefined;

  if (skew.type !== "tuple") {
    return { skewX, skewY };
  }

  for (const item of skew.value) {
    if (item.type === "function" && item.name === "skewX") {
      skewX = item;
    }

    if (item.type === "function" && item.name === "skewY") {
      skewY = item;
    }
  }

  return { skewX, skewY };
};

const isValidTransformOriginValue = (
  value: StyleValue
): value is UnitValue | KeywordValue => {
  return value.type === "unit" || value.type === "keyword";
};

export const extractTransformOriginValues = (
  value: TupleValue
): {
  x: KeywordValue | UnitValue;
  y: KeywordValue | UnitValue;
  z?: UnitValue;
} => {
  let x: KeywordValue | UnitValue = { type: "keyword", value: "center" };
  let y: KeywordValue | UnitValue = { type: "keyword", value: "center" };
  let z: UnitValue | undefined;

  // https://www.w3.org/TR/css-transforms-1/#transform-origin-property
  // https://github.com/mdn/content/issues/35411
  // If only one value is specified, the second value is assumed to be center.
  if (value.value.length === 1 && value.value[0].type === "unit") {
    x = value.value[0];
  }

  if (value.value.length === 1 && value.value[0].type === "keyword") {
    if (["top", "bottom"].includes(value.value[0].value)) {
      y = value.value[0];
    }

    if (["left", "right"].includes(value.value[0].value)) {
      x = value.value[0];
    }
  }

  // If keywords are used for x and y axises, their values can be swapped
  // and they are still valid. So, we are making sure that x is left or right
  // and y is top or bottom by checking their values.

  if (value.value.length === 2) {
    const [first, second] = value.value;
    if (
      isValidTransformOriginValue(first) === true &&
      isValidTransformOriginValue(second) === true
    ) {
      x = first;
      y = second;

      if (first.type === "keyword" && ["left", "right"].includes(first.value)) {
        x = first;
        y = second;
      } else if (
        first.type === "keyword" &&
        ["top", "bottom"].includes(first.value)
      ) {
        y = first;
        x = second;
      }
    }
  }

  if (value.value.length === 3) {
    const [first, second, third] = value.value;
    if (
      isValidTransformOriginValue(first) === true &&
      isValidTransformOriginValue(second) === true &&
      third.type === "unit"
    ) {
      x = first;
      y = second;
      z = third;

      if (first.type === "keyword" && ["left", "right"].includes(first.value)) {
        x = first;
        y = second;
      } else if (
        first.type === "keyword" &&
        ["top", "bottom"].includes(first.value)
      ) {
        y = first;
        x = second;
      }
    }
  }

  return {
    x,
    y,
    z,
  };
};
