import React from "react";
import { Flex, TextField } from "@webstudio-is/design-system";
import type { StyleValue } from "@webstudio-is/css-data";
import { CssValueInput, type IntermediateStyleValue } from "./css-value-input";
import { action } from "@storybook/addon-actions";
import { toValue } from "@webstudio-is/css-engine";

export default {
  component: CssValueInput,
};

export const WithKeywords = () => {
  const [value, setValue] = React.useState<StyleValue | IntermediateStyleValue>(
    {
      type: "keyword",
      value: "auto",
    }
  );

  return (
    <CssValueInput
      property="width"
      value={value}
      keywords={[
        { type: "keyword", value: "auto" },
        { type: "keyword", value: "min-content" },
        { type: "keyword", value: "max-content" },
        { type: "keyword", value: "fit-content" },
      ]}
      onChange={(value) => {
        setValue(value);
      }}
      onPreview={(value) => {
        action("onPreview")(value);
      }}
      onChangeComplete={(newValue) => {
        // on blur, select, enter etc.
        setValue(newValue);
        action("onChangeComplete")(newValue);
      }}
    />
  );
};

export const WithIcons = () => {
  const [value, setValue] = React.useState<StyleValue | IntermediateStyleValue>(
    {
      type: "keyword",
      value: "space-around",
    }
  );

  return (
    <CssValueInput
      property="alignItems"
      value={value}
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
        setValue(newValue);
      }}
      onPreview={(value) => {
        action("onPreview")(value);
      }}
      onChangeComplete={(newValue) => {
        // on blur, select, enter etc.
        setValue(newValue);
        action("onChangeComplete")(newValue);
      }}
    />
  );
};

export const WithUnits = () => {
  const [value, setValue] = React.useState<StyleValue | IntermediateStyleValue>(
    {
      type: "unit",
      value: 100,
      unit: "px",
    }
  );

  return (
    <Flex css={{ gap: "$spacing$9" }}>
      <CssValueInput
        property="rowGap"
        value={value}
        keywords={[
          { type: "keyword", value: "auto" },
          { type: "keyword", value: "min-content" },
          { type: "keyword", value: "max-content" },
          { type: "keyword", value: "fit-content" },
        ]}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        onPreview={(value) => {
          action("onPreview")(value);
        }}
        onChangeComplete={(newValue) => {
          // on blur, select, enter etc.
          setValue(newValue);
          action("onChangeComplete")(newValue);
        }}
      />
      <TextField
        readOnly
        value={
          value
            ? value?.type === "intermediate"
              ? value.value + value.unit
              : toValue(value)
            : ""
        }
      />
    </Flex>
  );
};
