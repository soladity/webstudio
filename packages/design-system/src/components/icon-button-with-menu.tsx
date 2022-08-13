import React from "react";
import { CheckIcon, IconComponent } from "@webstudio-is/icons";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { styled } from "../stitches.config";
import { Tooltip } from "./tooltip";

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  maxWidth: "$sizes$dropdownMenu",
  backgroundColor: "$colors$slate4",
  borderRadius: "$radii$1",
  padding: "$sizes$2",
  boxShadow:
    "0px 2px 7px rgba(0, 0, 0, 0.1), 0px 5px 17px rgba(0, 0, 0, 0.15), inset 0 0 1px 1px $colors$gray1, 0 0 0 1px $colors$gray8",
});

const itemStyles = {
  all: "unset",
  fontSize: "$2",
  lineHeight: 1,
  color: "$colors$slate12",
  borderRadius: "$radii$1",
  display: "flex",
  alignItems: "center",
  height: "$sizes$5",
  padding: "0 $space$5",
  position: "relative",
  paddingLeft: "$space$5",
  paddingRight: "$space$5",
  userSelect: "none",
  gap: "$space$2",
  "&:hover": {
    background: "$colors$blue10",
    color: "$colors$blue1",
    "& *": { fill: "$colors$blue1" },
  },
};

const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem, {
  ...itemStyles,
});
const StyledItemIndicator = styled(DropdownMenuPrimitive.ItemIndicator, {
  position: "absolute",
  left: 0,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  "& *": {
    fill: "$colors$gray4",
    stroke: "$colors$gray8",
  },
});

const IconButton = styled("button", {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "calc($radii$1 / 2)",
  width: "100%",
  height: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "$colors$gray12",
  backgroundColor: "$colors$loContrast",
  "&:hover": {
    backgroundColor: "$colors$gray3",
  },
  "& path": {
    fill: "currentColor",
  },
  "&[data-state=open]": {
    backgroundColor: "$colors$blue10",
    "& path": {
      fill: "$colors$blue1",
    },
  },
});

export const IconButtonWithMenu = ({
  label,
  value,
  items,
  onChange,
  isFromCurrentBreakpoint,
}: {
  label: string;
  value: string;
  items: Array<{
    label: string;
    name: string;
    icon: ReturnType<IconComponent>;
  }>;
  onChange: (value: string) => void;
  isFromCurrentBreakpoint: boolean;
}) => {
  const activeItem = items.find(({ name }) => name === value);
  const TriggerIcon = activeItem?.icon;
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <Tooltip
        content={label}
        delayDuration={700 * 2}
        disableHoverableContent={true}
      >
        <DropdownMenuPrimitive.Trigger asChild>
          <IconButton
            css={
              isFromCurrentBreakpoint
                ? {
                    color: "$colors$blue11",
                    backgroundColor: "$colors$blue4",
                    "&:not([data-state=open]):hover": {
                      backgroundColor: "$colors$blue4",
                    },
                  }
                : {}
            }
          >
            {TriggerIcon}
          </IconButton>
        </DropdownMenuPrimitive.Trigger>
      </Tooltip>

      <StyledContent sideOffset={4}>
        <DropdownMenuPrimitive.RadioGroup
          value={value}
          onValueChange={onChange}
        >
          {items.map(({ name, label, icon }) => {
            return (
              <StyledRadioItem key={name} value={label}>
                <StyledItemIndicator>
                  <CheckIcon />
                </StyledItemIndicator>
                {icon}
                {label}
              </StyledRadioItem>
            );
          })}
        </DropdownMenuPrimitive.RadioGroup>
        <StyledArrow offset={12} />
      </StyledContent>
    </DropdownMenuPrimitive.Root>
  );
};
