import { type ComponentProps, type ElementRef, forwardRef } from "react";
import { styled, type CSS } from "../stitches.config";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { theme } from "../stitches.config";

const SliderTrack = styled(SliderPrimitive.Track, {
  position: "relative",
  flexGrow: 1,
  backgroundColor: theme.colors.slate7,
  borderRadius: theme.borderRadius.pill,
  '&[data-orientation="horizontal"]': {
    height: 2,
  },
  '&[data-orientation="vertical"]': {
    width: 2,
    height: 100,
  },
});

const SliderRange = styled(SliderPrimitive.Range, {
  position: "absolute",
  background: theme.colors.blue9,
  borderRadius: "inherit",
  '&[data-orientation="horizontal"]': {
    height: "100%",
  },
  '&[data-orientation="vertical"]': {
    width: "100%",
  },
});

const SliderThumb = styled(SliderPrimitive.Thumb, {
  position: "relative",
  display: "block",
  width: 15,
  height: 15,
  outline: "none",
  backgroundColor: "white",
  boxShadow: "0 0 1px rgba(0,0,0,.3), 0 1px 4px rgba(0,0,0,.15)",
  borderRadius: theme.borderRadius.round,

  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -2,
    backgroundColor: "hsla(0,0%,0%,.035)",
    transform: "scale(1)",
    borderRadius: theme.borderRadius.round,
    transition: "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
  },

  "&:focus": {
    "&::after": {
      transform: "scale(2)",
    },
  },
});

export const StyledSlider = styled(SliderPrimitive.Root, {
  position: "relative",
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  userSelect: "none",
  touchAction: "none",
  height: 15,
  flexGrow: 1,

  '&[data-orientation="vertical"]': {
    flexDirection: "column",
    width: 15,
  },

  "@hover": {
    "&:hover": {
      [`& ${SliderTrack}`]: {
        backgroundColor: theme.colors.slate8,
      },
    },
  },
});

type SliderPrimitiveProps = Omit<
  ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue"
> & {
  value?: number | number[];
  defaultValue?: number | number[];
};
type SliderProps = SliderPrimitiveProps & { css?: CSS };

const toArrayValue = (value?: Array<number> | number) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined) {
    return;
  }
  return [value];
};

export const Slider = forwardRef<ElementRef<typeof StyledSlider>, SliderProps>(
  ({ value, defaultValue, ...props }, forwardedRef) => {
    const realValue = value || defaultValue || 0;
    const hasRange = Array.isArray(realValue);
    const thumbsArray = hasRange ? realValue : [realValue];

    return (
      <StyledSlider
        {...props}
        ref={forwardedRef}
        value={toArrayValue(value)}
        defaultValue={toArrayValue(defaultValue)}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        {thumbsArray?.map((_, i: number) => (
          <SliderThumb key={i} />
        ))}
      </StyledSlider>
    );
  }
);
Slider.displayName = "Slider";
