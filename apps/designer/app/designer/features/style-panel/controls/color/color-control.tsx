import { useState } from "react";
import { ColorResult, RGBColor, SketchPicker } from "react-color";
import {
  Box,
  Grid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  TextField,
  Tooltip,
} from "@webstudio-is/design-system";
// import { PropertyName } from "../../shared/property-name";
import { getFinalValue } from "../../shared/get-final-value";
import type { ControlProps } from "../../style-sections";
import { StyleConfig } from "../../shared/configs";

const stringifyRGBA = (color: RGBColor) => {
  const { r, g, b, a = 1 } = color;

  return `rgba(${r},${g},${b},${a})`;
};

type ColorPickerProps = {
  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
  value: string;
  id: string;
  styleConfig: StyleConfig;
};

const ColorPicker = ({
  value,
  onChange,
  onChangeComplete,
  id,
  styleConfig,
}: ColorPickerProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  // Color picker will use 0 as alpha value, which will force user to set alpha every time they have to change from transparent
  if (value === "transparent") value = "";

  return (
    <Popover
      modal
      open={displayColorPicker}
      onOpenChange={setDisplayColorPicker}
    >
      <PopoverTrigger asChild aria-label="Open color picker">
        <Grid
          css={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(1, 1fr)",
          }}
        >
          <Tooltip
            content={styleConfig.label}
            delayDuration={700 / 4}
            disableHoverableContent={true}
          >
            <Box
              css={{
                gridArea: "1 / 1 / 2 / 2",
                zIndex: 1,
                width: "calc($sizes$6 - 6px)",
                height: "calc($sizes$6 - 6px)",
                margin: 3,
                borderRadius: 2,
                background: value,
              }}
            />
          </Tooltip>
          <TextField
            css={{
              height: "$6",
              gridArea: "1 / 1 / -1 / -1",
              paddingLeft: "calc($sizes$6 + 6px)",
            }}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => setDisplayColorPicker((shown) => !shown)}
            value={value}
            id={id}
          />
        </Grid>
      </PopoverTrigger>

      <PopoverContent>
        <SketchPicker
          color={value}
          onChange={(color: ColorResult) => onChange(stringifyRGBA(color.rgb))}
          onChangeComplete={(color: ColorResult) => {
            onChangeComplete(stringifyRGBA(color.rgb));
          }}
          // @todo to remove both when we have preset colors
          presetColors={[]}
          styles={{
            default: {
              picker: {
                padding: 10,
              },
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const ColorControl = ({
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

  return (
    <Grid columns={1} align="center" gapX="1">
      {/* <PropertyName property={styleConfig.property} label={styleConfig.label} /> */}
      {/* <Flex align="center" css={{ gridColumn: "4/4" }} gap="1"> */}
      <ColorPicker
        id={styleConfig.property}
        value={String(value.value)}
        styleConfig={styleConfig}
        onChange={(value) => {
          setValue(value, { isEphemeral: true });
        }}
        onChangeComplete={setValue}
      />
      {/* </Flex> */}
    </Grid>
  );
};
