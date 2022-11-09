import * as SelectPrimitive from "@radix-ui/react-select";
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
  gap: "$spacing$5",
  flexShrink: 0,
  borderRadius: "$1",
  backgroundColor: "$loContrast",
  color: "$hiContrast",
  boxShadow: "inset 0 0 0 1px $colors$slate7",
  height: 28, // @todo waiting for the sizing scale
  px: "$spacing$5",
  fontSize: "$1",
  "&:focus": {
    boxShadow:
      "inset 0px 0px 0px 1px $colors$blue8, 0px 0px 0px 1px $colors$blue8",
  },
  paddingRight: 0,
  paddingLeft: "$spacing$5",
  textTransform: "capitalize",
  fontWeight: "inherit",

  variants: {
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
});

const StyledValue = styled("span", {
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  flexGrow: 0,
});

const StyledIcon = styled(SelectPrimitive.Icon, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "$spacing$2 $spacing$2 $spacing$2 0px",
});

export const SelectContent = styled(SelectPrimitive.Content, {
  overflow: "hidden",
  backgroundColor: "$colors$slate4",
  borderRadius: "$1",
  boxShadow:
    "0px 2px 7px rgba(0, 0, 0, 0.1), 0px 5px 17px rgba(0, 0, 0, 0.15), inset 0 0 1px 1px $colors$slate1, 0 0 0 1px $colors$slate8",
});

export const SelectViewport = styled(SelectPrimitive.Viewport, {
  p: "$spacing$3",
});

const StyledItem = styled(SelectPrimitive.Item, {
  all: "unset",
  fontSize: "$2",
  lineHeight: 1,
  color: "$hiContrast",
  display: "flex",
  alignItems: "center",
  height: "$spacing$11",
  padding: "0 $spacing$5",
  position: "relative",
  userSelect: "none",
  borderRadius: "$1",

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
  color: "$hiContrast",
  cursor: "default",
};

export const SelectScrollUpButton = styled(
  SelectPrimitive.ScrollUpButton,
  scrollButtonStyles
);

export const SelectScrollDownButton = styled(
  SelectPrimitive.ScrollDownButton,
  scrollButtonStyles
);

const SelectItemBase = (
  { children, ...props }: SelectItemProps,
  forwardedRef: Ref<HTMLDivElement>
) => {
  return (
    <StyledItem {...props} ref={forwardedRef}>
      <Grid align="center" css={{ gridTemplateColumns: "$spacing$10 1fr" }}>
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
export const SelectItem = React.forwardRef(SelectItemBase);

export type SelectOption = string;

export type SelectProps<Option = SelectOption> = Omit<
  React.ComponentProps<typeof StyledTrigger>,
  "onChange" | "value" | "defaultValue"
> & {
  options: Option[];
  defaultValue?: Option;
  value?: Option;
  onChange?: (option: Option) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  getLabel?: (option: Option) => string | undefined;
  getValue?: (option: Option) => string | undefined;
};

const SelectBase = (
  {
    options,
    value,
    defaultValue,
    placeholder = "Select an option",
    onChange,
    onOpenChange,
    open,
    getLabel = (option) => option,
    getValue = (option) => option,
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
      open={open}
      onOpenChange={onOpenChange}
    >
      <StyledTrigger ref={forwardedRef} {...props}>
        <SelectPrimitive.Value asChild>
          <StyledValue>{value ? getLabel(value) : placeholder}</StyledValue>
        </SelectPrimitive.Value>
        <StyledIcon>
          <ChevronDownIcon />
        </StyledIcon>
      </StyledTrigger>
      <SelectPrimitive.Portal>
        <SelectContent>
          <SelectScrollUpButton>
            <ChevronUpIcon />
          </SelectScrollUpButton>
          <SelectViewport>
            {options.map((option) => (
              <SelectItem
                key={getValue(option)}
                value={getValue(option) ?? ""}
                textValue={getLabel(option)}
              >
                {getLabel(option)}
              </SelectItem>
            ))}
          </SelectViewport>
          <SelectScrollDownButton>
            <ChevronDownIcon />
          </SelectScrollDownButton>
        </SelectContent>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export const Select = React.forwardRef(SelectBase);
Select.displayName = "Select";
