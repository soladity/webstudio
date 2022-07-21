import { ChangeEvent, ChangeEventHandler, useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  Label,
  Text,
  Button,
  Collapsible,
  Combobox,
  Comboicon,
  Select,
  IconButton,
} from "~/shared/design-system";
import {
  TriangleRightIcon,
  TriangleDownIcon,
  LockClosedIcon,
} from "~/shared/icons";
import * as icons from "~/shared/icons";
import type { StyleConfig } from "./lib/configs";
import {
  categories,
  type Style,
  type StyleProperty,
  type Category,
  type StyleValue,
  type CSS,
} from "@webstudio-is/react-sdk";
import type { SetProperty } from "./lib/use-style-data";
import type { InheritedStyle } from "./lib/get-inherited-style";
import { ColorPicker } from "./lib/color-picker";
import {
  SpacingWidget,
  type SpacingProperty,
  type SpacingStyles,
} from "./lib/spacing-widget";
import { useIsFromCurrentBreakpoint } from "./lib/use-is-from-current-breakpoint";
import { propertyNameColorForSelectedBreakpoint } from "./lib/constants";
import { isCatchResponse } from "@remix-run/react/dist/data";

const getFinalValue = ({
  currentStyle,
  inheritedStyle,
  property,
}: {
  currentStyle: Style;
  inheritedStyle: InheritedStyle;
  property: StyleProperty;
}): StyleValue | void => {
  const currentValue = currentStyle[property];
  const inheritedValue =
    property in inheritedStyle ? inheritedStyle[property].value : undefined;
  if (currentValue?.value === "inherit" && inheritedValue !== undefined) {
    return inheritedValue;
  }
  return currentValue;
};

type PropertyProps = {
  property: StyleProperty;
  label: string;
  css?: CSS;
};

const PropertyName = ({ property, label, css }: PropertyProps) => {
  const isCurrentBreakpoint = useIsFromCurrentBreakpoint(property);

  return (
    <Label
      css={{
        gridColumn: "1",
        color: isCurrentBreakpoint
          ? propertyNameColorForSelectedBreakpoint
          : "$hiContrast",
        ...css,
      }}
      variant="contrast"
      size="1"
      htmlFor={property}
    >
      {label}
    </Label>
  );
};

const Unit = ({ value }: { value: StyleValue }) => {
  if (value.type !== "unit" || value.unit === "number") return null;
  return (
    <Text
      css={{
        fontSize: "$1",
        cursor: "default",
      }}
    >
      {value.unit}
    </Text>
  );
};

type ControlProps = {
  setProperty: SetProperty;
  currentStyle: Style;
  inheritedStyle: InheritedStyle;
  styleConfig: StyleConfig;
};

const ColorControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  if (styleConfig.control !== "Color") return null;
  // @todo show which instance we inherited the value from
  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });
  if (value === undefined) return null;
  const setValue = setProperty(styleConfig.property);

  return (
    <Grid columns={2} align="center" gapX="1">
      <PropertyName property={styleConfig.property} label={styleConfig.label} />
      <Flex align="center" css={{ gridColumn: "2/4" }} gap="1">
        <ColorPicker
          id={styleConfig.property}
          value={String(value.value)}
          onChange={(value) => {
            setValue(value, { isEphemeral: true });
          }}
          onChangeComplete={setValue}
        />
      </Flex>
    </Grid>
  );
};

const SpacingControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  if (styleConfig.control !== "Spacing") return null;

  const styles = categories.spacing.properties.reduce(
    (acc: SpacingStyles, property: SpacingProperty): SpacingStyles => {
      const value = getFinalValue({
        currentStyle,
        inheritedStyle,
        property,
      });
      if (value !== undefined) {
        if (property.includes("margin")) {
          acc.margins[property] = value;
        } else {
          acc.paddings[property] = value;
        }
      }

      return acc;
    },
    { margins: {}, paddings: {} } as SpacingStyles
  );

  return <SpacingWidget setProperty={setProperty} values={styles} />;
};

// @todo
// This is a cursor image for drag&drop value changing on the input by dragging horizontally
//const svgCursor =
//  '<svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M8.00012 1.5C8.00012 1.22386 7.77626 1 7.50012 1C7.22398 1 7.00012 1.22386 7.00012 1.5V13.5C7.00012 13.7761 7.22398 14 7.50012 14C7.77626 14 8.00012 13.7761 8.00012 13.5V1.5ZM3.31812 5.818C3.49386 5.64227 3.49386 5.35734 3.31812 5.18161C3.14239 5.00587 2.85746 5.00587 2.68173 5.18161L0.681729 7.18161C0.505993 7.35734 0.505993 7.64227 0.681729 7.818L2.68173 9.818C2.85746 9.99374 3.14239 9.99374 3.31812 9.818C3.49386 9.64227 3.49386 9.35734 3.31812 9.18161L2.08632 7.9498H5.50017C5.7487 7.9498 5.95017 7.74833 5.95017 7.4998C5.95017 7.25128 5.7487 7.0498 5.50017 7.0498H2.08632L3.31812 5.818ZM12.3181 5.18161C12.1424 5.00587 11.8575 5.00587 11.6817 5.18161C11.506 5.35734 11.506 5.64227 11.6817 5.818L12.9135 7.0498H9.50017C9.25164 7.0498 9.05017 7.25128 9.05017 7.4998C9.05017 7.74833 9.25164 7.9498 9.50017 7.9498H12.9135L11.6817 9.18161C11.506 9.35734 11.506 9.64227 11.6817 9.818C11.8575 9.99374 12.1424 9.99374 12.3181 9.818L14.3181 7.818C14.4939 7.64227 14.4939 7.35734 14.3181 7.18161L12.3181 5.18161Z" fill="#fff"></path></svg>';

//const cursorUrl = `data:image/svg+xml;base64,${btoa(svgCursor)}`;

const ComboboxControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  if (styleConfig.control !== "Combobox") return null;

  // @todo show which instance we inherited the value from
  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });

  if (value === undefined) return null;

  const setValue = setProperty(styleConfig.property);

  switch (styleConfig.property) {
    case "rowGap":
    case "columnGap": {
      return (
        <input
          type="number"
          value={value.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setValue(event.target.value)
          }
          style={{
            width: "100%",
            boxSizing: "border-box",
            outline: "none",
            borderRadius: "4px",
            height: "28px",
            border: "1px solid var(--colors-slate8)",
          }}
        />
      );
    }
  }

  return (
    <Grid columns={2} align="center" gapX="1">
      {/* @todo needs icon variant */}
      <PropertyName property={styleConfig.property} label={styleConfig.label} />
      <Flex align="center" css={{ gridColumn: "2/4" }} gap="1">
        <Combobox
          id={styleConfig.property}
          items={styleConfig.items}
          variant="ghost"
          css={{
            // @todo drag&drop cursor to adjust numeric value
            // const cursorUrl = data:image/svg+xml;base64,${btoa(svgCursor)}
            //cursor: `url(${cursorUrl}), text`,
            textAlign: "right",
          }}
          state={value.type === "invalid" ? "invalid" : undefined}
          value={String(value.value)}
          onValueSelect={setValue}
          onValueEnter={setValue}
          onItemEnter={(value) => {
            setValue(value, { isEphemeral: true });
          }}
          onItemLeave={() => {
            setValue(String(value.value), { isEphemeral: true });
          }}
        />
        <Unit value={value} />
      </Flex>
    </Grid>
  );
};

const SelectControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  // @todo show which instance we inherited the value from
  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });

  if (value === undefined) return null;

  const setValue = setProperty(styleConfig.property);

  return (
    <>
      <PropertyName
        property={styleConfig.property}
        label={styleConfig.label}
        css={{ fontWeight: "500", marginRight: "8px" }}
      />
      <Select
        options={styleConfig.items.map(({ label }) => label)}
        value={String(value.value)}
        onChange={setValue}
      />
    </>
  );
};

const ComboiconControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });

  if (value === undefined) return null;

  const setValue = setProperty(styleConfig.property);
  const currentValue = value.value as string;
  const Icon = (icons as any)[styleConfig.property]?.[currentValue];
  const isCurrentBreakpoint = useIsFromCurrentBreakpoint(styleConfig.property);
  return (
    <Comboicon
      id={styleConfig.property}
      items={styleConfig.items}
      value={String(currentValue)}
      onChange={setValue}
      css={
        isCurrentBreakpoint
          ? {
              color: "$colors$blue11",
              backgroundColor: "$colors$blue4",
              "&:hover": {
                color: "$colors$blue11",
                backgroundColor: "$colors$blue4",
              },
              "& path": {
                fill: "$colors$blue11",
              },
            }
          : {}
      }
    >
      {Icon && <Icon />}
    </Comboicon>
  );
};

const GridControl = ({ css, currentStyle, ...rest }: any) => {
  return (
    <Box
      css={{
        border: "2px solid $colors$slate8",
        background: "#FFF",
        borderRadius: "4px",
        textAlign: "center",
        width: "100%",
        aspectRatio: "1 / 1",
        padding: "30px",
        ...css,
      }}
    ></Box>
  );
  return <></>;
};

const LockControl = ({ css, currentStyle, setProperty, ...rest }: any) => {
  return (
    <IconButton css={{ width: "100%", ...css }} {...rest}>
      <icons.lock.closed />
    </IconButton>
  );
};

const ShowMore = ({ styleConfigs }: { styleConfigs: Array<JSX.Element> }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (styleConfigs.length === 0) return null;
  return (
    <Collapsible.Root asChild onOpenChange={setIsOpen}>
      <Flex direction="column" gap="3">
        <Collapsible.Trigger asChild>
          <Button css={{ width: "100%", gap: "$1" }}>
            {isOpen ? <TriangleDownIcon /> : <TriangleRightIcon />}Show more
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <Flex direction="column" gap="3">
            {styleConfigs}
          </Flex>
        </Collapsible.Content>
      </Flex>
    </Collapsible.Root>
  );
};

type RenderPropertyProps = {
  setProperty: SetProperty;
  currentStyle: Style;
  inheritedStyle: InheritedStyle;
  styleConfig: StyleConfig;
  category: Category;
};

export const renderProperty = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
  category,
}: RenderPropertyProps) => {
  const Control = controls[styleConfig.control];
  const { property } = styleConfig;
  const key = category + "-" + property;
  return (
    <Box
      key={key}
      data-type={styleConfig.control.toLowerCase()}
      data-property={property}
      css={{ gridArea: property }}
    >
      <Control
        currentStyle={currentStyle}
        inheritedStyle={inheritedStyle}
        setProperty={setProperty}
        styleConfig={styleConfig}
      />
    </Box>
  );
};

type RenderCategoryProps = {
  setProperty: SetProperty;
  currentStyle: Style;
  category: Category;
  styleConfigsByCategory: JSX.Element[];
  moreStyleConfigsByCategory: JSX.Element[];
};
// Categories should render themselves because most Categories will not be flat un-ordered lists with
// the new designs, refactor ColorControl, SpacingControl if needed.
export const renderCategory = ({
  setProperty,
  currentStyle,
  category,
  styleConfigsByCategory,
  moreStyleConfigsByCategory,
}: RenderCategoryProps) => {
  switch (category) {
    case "layout": {
      const display = currentStyle.display?.value;
      switch (currentStyle.display?.value) {
        case "flex": {
          return (
            <>
              <Grid
                css={{
                  alignItems: "center",
                  gridTemplateColumns: "repeat(12, 1fr);",
                  gridTemplateRows: "auto 0px auto auto 0px auto",
                  gridTemplateAreas: `
                    "display display display display display display display display display display display display"
                    "grid grid grid grid grid . . . . . . ."
                    "grid grid grid grid grid flexDirection flexDirection flexWrap flexWrap justifyItems justifyItems ."
                    "grid grid grid grid grid alignItems alignItems justifyContent justifyContent alignContent alignContent ."
                    "grid grid grid grid grid . . . . . . ."
                    "rowGap rowGap rowGap rowGap rowGap lock lock columnGap columnGap columnGap columnGap columnGap"
                  `,
                  gap: "8px",
                  "& > [data-type=comboicon]": {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  },
                  // @todo placeContent is shorthand prop for other properties, thus a duplicate
                  "& > [data-property=placeContent]": {
                    display: "none",
                  },
                  "& > [data-property=justifyItems]": {
                    display: "none",
                  },
                }}
              >
                <GridControl
                  data-property="grid"
                  css={{ gridArea: "grid" }}
                  currentStyle={currentStyle}
                  setProperty={setProperty}
                />
                <LockControl
                  data-property="lock"
                  css={{ gridArea: "lock" }}
                  currentStyle={currentStyle}
                  setProperty={setProperty}
                />
                {styleConfigsByCategory}
              </Grid>
              <ShowMore styleConfigs={moreStyleConfigsByCategory} />
            </>
          );
        }
        default: {
          styleConfigsByCategory = [styleConfigsByCategory[0]];
        }
      }
    }
  }

  return (
    <>
      {styleConfigsByCategory}
      <ShowMore styleConfigs={moreStyleConfigsByCategory} />
    </>
  );
};

const controls: {
  [key: string]: (props: ControlProps) => JSX.Element | null;
} = {
  Color: ColorControl,
  Spacing: SpacingControl,
  Combobox: ComboboxControl,
  Comboicon: ComboiconControl,
  Select: SelectControl,
};
