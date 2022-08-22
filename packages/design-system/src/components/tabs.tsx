import React from "react";
import { styled, CSS } from "../stitches.config";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { __DEPRECATED__Text } from "./deprecated/text";

export const Tabs = styled(TabsPrimitive.Root, {
  display: "flex",
  '&[data-orientation="horizontal"]': {
    flexDirection: "column",
  },
});

export const TabsTrigger = styled(TabsPrimitive.Trigger, {
  flexShrink: 0,
  height: "$7",
  display: "inline-flex",
  lineHeight: 1,
  fontFamily: "inherit",
  fontSize: "$1",
  px: "$2",
  userSelect: "none",
  outline: "none",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  zIndex: "10",
  backgroundColor: "transparent",
  ["&:first-child"]: {
    paddingLeft: "$3",
  },
  [`& > ${__DEPRECATED__Text}`]: {
    color: "$gray9",
    fontSize: "11px",
    fontWeight: "600",
  },
  "@hover": {
    "&:hover": {
      color: "$hiContrast",
    },
  },

  '&[data-state="active"]': {
    [`& > ${__DEPRECATED__Text}`]: {
      color: "$hiContrast",
    },
  },

  '&[data-orientation="vertical"]': {
    justifyContent: "flex-start",
  },
});

const StyledTabsList = styled(TabsPrimitive.List, {
  flexShrink: 0,
  display: "flex",
  borderBottom: "1px solid $colors$gray6",
  "&:focus": {
    outline: "none",
    boxShadow: "inset 0 0 0 1px $gray8, 0 0 0 1px $gray8",
  },
  '&[data-orientation="vertical"]': {
    flexDirection: "column",
    boxShadow: "inset -1px 0 0 $gray6",
  },
});

type TabsListPrimitiveProps = React.ComponentProps<typeof TabsPrimitive.List>;
type TabsListProps = TabsListPrimitiveProps & { css?: CSS };

export const TabsList = React.forwardRef<
  React.ElementRef<typeof StyledTabsList>,
  TabsListProps
>((props, forwardedRef) => (
  <>
    <StyledTabsList {...props} ref={forwardedRef} />
  </>
));

TabsList.displayName = "TabsList";

export const TabsContent = styled(TabsPrimitive.Content, {
  flexGrow: 1,
  "&:focus": {
    outline: "none",
    boxShadow: "inset 0 0 0 1px $gray8, 0 0 0 1px $gray8",
  },
  '&[data-state="inactive"]': {
    display: "none",
  },
});
