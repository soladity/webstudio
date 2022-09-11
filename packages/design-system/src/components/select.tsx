import * as SelectPrimitive from "@radix-ui/react-select";
import noop from "lodash.noop";
import React, { ReactNode, Ref } from "react";
import { Grid } from "./grid";
import { Box } from "./box";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@webstudio-is/icons";
import { styled } from "../stitches.config";

const StyledTrigger = styled(SelectPrimitive.SelectTrigger, {
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontVariantNumeric: "tabular-nums",
  gap: "$2",
  flexShrink: 0,
  borderRadius: "$1",
  backgroundColor: "$loContrast",
  color: "$hiContrast",
  boxShadow: "inset 0 0 0 1px $colors$slate7",
  "&:hover": {
    backgroundColor: "$slateA3",
  },
  "&:focus": {
    boxShadow:
      "inset 0px 0px 0px 1px $colors$blue8, 0px 0px 0px 1px $colors$blue8",
  },

  variants: {
    size: {
      1: { padding: "0 $1 0 $2", fontSize: "$1", height: "$5" },
      2: { padding: "0 $2 0 $3", height: "$6", fontSize: "$3" },
    },
    ghost: {
      true: {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  },
  defaultVariants: {
    size: 1,
  },
});

const StyledIcon = styled(SelectPrimitive.Icon, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "calc($space$1 / 2)",
});

const StyledContent = styled(SelectPrimitive.Content, {
  overflow: "hidden",
  backgroundColor: "$colors$slate4",
  borderRadius: "$1",
  boxShadow:
    "0px 2px 7px rgba(0, 0, 0, 0.1), 0px 5px 17px rgba(0, 0, 0, 0.15), inset 0 0 1px 1px $colors$slate1, 0 0 0 1px $colors$slate8",
});

const StyledViewport = styled(SelectPrimitive.Viewport, {
  py: "$1",
});

const StyledItem = styled(SelectPrimitive.Item, {
  all: "unset",
  fontSize: "$2",
  lineHeight: 1,
  color: "$hiContrast",
  display: "flex",
  alignItems: "center",
  height: "$5",
  padding: "0 $2",
  position: "relative",
  userSelect: "none",

  "&[data-disabled]": {
    color: "$muted",
    pointerEvents: "none",
  },

  "&:focus": {
    backgroundColor: "$blue10",
    color: "white",
  },
});

const scrollButtonStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 25,
  color: "$text",
  cursor: "default",
};

const SelectScrollUpButton = styled(
  SelectPrimitive.ScrollUpButton,
  scrollButtonStyles
);

const SelectScrollDownButton = styled(
  SelectPrimitive.ScrollDownButton,
  scrollButtonStyles
);

const SelectItemBase = (
  { children, ...props }: SelectItemProps,
  forwardedRef: Ref<HTMLDivElement>
) => {
  return (
    <StyledItem {...props} ref={forwardedRef}>
      <Grid align="center" css={{ gridTemplateColumns: "$4 1fr" }}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
        <Box css={{ gridColumn: 2 }}>
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </Box>
      </Grid>
    </StyledItem>
  );
};

type SelectItemProps = SelectPrimitive.SelectItemProps & {
  children: ReactNode;
};
const SelectItem = React.forwardRef(SelectItemBase);

export type SelectOption = string;

export type SelectProps<T = SelectOption> = Omit<
  React.ComponentProps<typeof StyledTrigger>,
  "onChange" | "value" | "defaultValue"
> & {
  options: T[];
  defaultValue?: T;
  value?: T;
  onChange?: (option: T) => void;
  placeholder?: string;
  getLabel?: (option: T) => string | undefined;
};

const SelectBase = (
  {
    options,
    value,
    defaultValue,
    placeholder = "Select an option",
    onChange = noop,
    getLabel = (option) => option,
    name,
    ...props
  }: SelectProps,
  forwardedRef: Ref<HTMLButtonElement>
) => {
  return (
    <SelectPrimitive.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
    >
      <StyledTrigger ref={forwardedRef} {...props}>
        <SelectPrimitive.Value>
          {value ? getLabel(value) : placeholder}
        </SelectPrimitive.Value>
        <StyledIcon>
          <ChevronDownIcon />
        </StyledIcon>
      </StyledTrigger>
      <SelectPrimitive.Portal>
        <StyledContent>
          <SelectScrollUpButton>
            <ChevronUpIcon />
          </SelectScrollUpButton>
          <StyledViewport>
            {options.map((option) => (
              <SelectItem key={option} value={option} textValue={option}>
                {getLabel(option)}
              </SelectItem>
            ))}
          </StyledViewport>
          <SelectScrollDownButton>
            <ChevronDownIcon />
          </SelectScrollDownButton>
        </StyledContent>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export const Select = React.forwardRef(SelectBase);
Select.displayName = "Select";
