import { useState } from "react";
import { ColorResult, RGBColor, SketchPicker } from "react-color";
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  TextField,
  css,
} from "@webstudio-is/design-system";

const stringifyRGBA = (color: RGBColor) => {
  const { r, g, b, a = 1 } = color;

  return `rgba(${r},${g},${b},${a})`;
};

const pickerStyle = css({
  padding: "$2",
  background: "$panel",
  // @todo this lib doesn't have another way to define styles for inputs
  // we should either submit a PR or replace it
  "& input": {
    color: "$hiContrast",
    background: "$loContrast",
  },
});

const defaultPickerStyles = {
  default: {
    // Workaround to allow overrides using className
    picker: { padding: "", background: "" },
  },
};

type ColorPickerProps = {
  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
  value: string;
  id: string;
};

export const ColorPicker = ({
  value,
  onChange,
  onChangeComplete,
  id,
}: ColorPickerProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  // Color picker will use 0 as alpha value, which will force user to set alpha every time they have to change from transparent
  if (value === "transparent") value = "";

  return (
    <TextField
      onChange={(e) => onChange(e.target.value)}
      value={value}
      id={id}
      prefix={
        <Popover
          modal
          open={displayColorPicker}
          onOpenChange={setDisplayColorPicker}
        >
          <PopoverTrigger
            asChild
            aria-label="Open color picker"
            onClick={() => setDisplayColorPicker((shown) => !shown)}
          >
            <Box
              css={{
                width: "$sizes$3",
                height: "$sizes$3",
                borderRadius: 2,
                background: value,
              }}
            />
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent>
              <SketchPicker
                color={value}
                onChange={(color: ColorResult) =>
                  onChange(stringifyRGBA(color.rgb))
                }
                onChangeComplete={(color: ColorResult) => {
                  onChangeComplete(stringifyRGBA(color.rgb));
                }}
                // @todo to remove both when we have preset colors
                presetColors={[]}
                className={pickerStyle()}
                styles={defaultPickerStyles}
              />
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      }
    />
  );
};
