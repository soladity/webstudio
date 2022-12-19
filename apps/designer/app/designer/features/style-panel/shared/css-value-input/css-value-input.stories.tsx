import * as React from "react";
import { Flex, TextField } from "@webstudio-is/design-system";
import type { StyleValue } from "@webstudio-is/css-data";
import { CssValueInput, type IntermediateStyleValue } from "./css-value-input";
import { action } from "@storybook/addon-actions";
import { toValue } from "@webstudio-is/css-engine";

export default {
  component: CssValueInput,
};

export const WithKeywords = () => {
  const [value, setValue] = React.useState<StyleValue>({
    type: "keyword",
    value: "auto",
  });

  const [intermediateValue, setIntermediateValue] = React.useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <CssValueInput
      property="width"
      value={value}
      intermediateValue={intermediateValue}
      keywords={[
        { type: "keyword", value: "auto" },
        { type: "keyword", value: "min-content" },
        { type: "keyword", value: "max-content" },
        { type: "keyword", value: "fit-content" },
      ]}
      onChange={(value) => {
        setIntermediateValue(value);
      }}
      onHighlight={(value) => {
        action("onHighlight")(value);
      }}
      onChangeComplete={(newValue) => {
        // on blur, select, enter etc.
        setValue(newValue);
        setIntermediateValue(undefined);
        action("onChangeComplete")(newValue);
      }}
    />
  );
};

export const WithIcons = () => {
  const [value, setValue] = React.useState<StyleValue>({
    type: "keyword",
    value: "space-around",
  });

  const [intermediateValue, setIntermediateValue] = React.useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <CssValueInput
      property="alignItems"
      value={value}
      intermediateValue={intermediateValue}
      keywords={[
        { type: "keyword", value: "normal" },
        { type: "keyword", value: "start" },
        { type: "keyword", value: "end" },
        { type: "keyword", value: "center" },
        { type: "keyword", value: "stretch" },
        { type: "keyword", value: "space-around" },
        { type: "keyword", value: "space-between" },
      ]}
      onChange={(newValue) => {
        setIntermediateValue(newValue);
      }}
      onHighlight={(value) => {
        action("onHighlight")(value);
      }}
      onChangeComplete={(newValue) => {
        // on blur, select, enter etc.
        setValue(newValue);
        setIntermediateValue(undefined);
        action("onChangeComplete")(newValue);
      }}
    />
  );
};

export const WithUnits = () => {
  const [value, setValue] = React.useState<StyleValue>({
    type: "unit",
    value: 100,
    unit: "px",
  });

  const [intermediateValue, setIntermediateValue] = React.useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <Flex css={{ gap: "$spacing$9" }}>
      <CssValueInput
        property="rowGap"
        value={value}
        intermediateValue={intermediateValue}
        keywords={[
          { type: "keyword", value: "auto" },
          { type: "keyword", value: "min-content" },
          { type: "keyword", value: "max-content" },
          { type: "keyword", value: "fit-content" },
        ]}
        onChange={(newValue) => {
          setIntermediateValue(newValue);
        }}
        onHighlight={(value) => {
          action("onHighlight")(value);
        }}
        onChangeComplete={(newValue) => {
          // on blur, select, enter etc.
          setValue(newValue);
          setIntermediateValue(undefined);
          action("onChangeComplete")(newValue);
        }}
      />
      <TextField
        readOnly
        value={
          value
            ? intermediateValue?.type === "intermediate"
              ? intermediateValue.value + intermediateValue.unit
              : toValue(value)
            : ""
        }
      />
    </Flex>
  );
};
