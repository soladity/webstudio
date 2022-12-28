import { CheckIcon, IconComponent } from "@webstudio-is/icons";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { styled } from "../stitches.config";
import { Tooltip } from "./tooltip";
import { IconButton } from "./icon-button";

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  width: 192,
  maxHeight: 238,
  overflow: "auto",
  backgroundColor: "$colors$slate4",
  borderRadius: "$borderRadius$4",
  padding: "$spacing$5",
  boxShadow:
    "0px 2px 7px rgba(0, 0, 0, 0.1), 0px 5px 17px rgba(0, 0, 0, 0.15), inset 0 0 1px 1px $colors$gray1, 0 0 0 1px $colors$gray8",
});

const itemStyles = {
  all: "unset",
  fontSize: "$fontSize$3",
  lineHeight: 1,
  color: "$colors$slate12",
  borderRadius: "$borderRadius$4",
  display: "flex",
  alignItems: "center",
  height: "$spacing$11",
  padding: "0 $spacing$11",
  position: "relative",
  paddingLeft: "$spacing$11",
  paddingRight: "$spacing$11",
  userSelect: "none",
  gap: "$spacing$5",
  "&[data-highlighted]": {
    background: "$colors$blue10",
    color: "$colors$blue1",
    "& *": { fill: "$colors$blue1" },
  },
};

const itemIndicatorStyle = {
  position: "absolute",
  left: 0,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const arrowStyle = {
  "& *": {
    fill: "$colors$gray4",
    stroke: "$colors$gray8",
  },
};

const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem, itemStyles);

const StyledItemIndicator = styled(
  DropdownMenuPrimitive.ItemIndicator,
  itemIndicatorStyle
);

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, arrowStyle);

export const IconButtonWithMenu = ({
  variant,
  icon: Icon,
  label,
  value,
  items,
  onChange,
  onHover,
}: {
  variant: "default" | "preset" | "set" | "inherited" | "active";
  icon?: JSX.Element;
  label?: string;
  value: string;
  items: Array<{
    label: string;
    name: string;
    icon?: ReturnType<IconComponent>;
  }>;
  onChange?: (value: string) => void;
  onHover?: (value: string) => void;
}) => {
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <Tooltip
        content={label}
        delayDuration={400}
        disableHoverableContent={true}
      >
        <DropdownMenuPrimitive.Trigger asChild>
          <IconButton variant={variant}>{Icon}</IconButton>
        </DropdownMenuPrimitive.Trigger>
      </Tooltip>
      <DropdownMenuPrimitive.Portal>
        <StyledContent sideOffset={4} collisionPadding={16} side="bottom">
          <DropdownMenuPrimitive.RadioGroup
            value={value}
            onValueChange={onChange}
          >
            {items.map(({ name, label, icon }) => {
              return (
                <StyledRadioItem
                  key={name}
                  value={label}
                  onFocus={() => onHover?.(name)}
                  onBlur={() => onHover?.(value)}
                >
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
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
