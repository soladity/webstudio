import React from "react";
import { styled, CSS } from "../stitches.config";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Text } from "./text";

export const Tabs = styled(TabsPrimitive.Root, {
  display: "flex",
  '&[data-orientation="horizontal"]': {
    flexDirection: "column",
  },
});

export const TabsTrigger = styled(TabsPrimitive.Trigger, {
  flexShrink: 0,
  height: "$spacing$17",
  display: "inline-flex",
  lineHeight: 1,
  fontFamily: "inherit",
  fontSize: "$fontSize$3",
  px: "$spacing$5",
  userSelect: "none",
  outline: "none",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  backgroundColor: "transparent",
  ["&:first-child"]: {
    paddingLeft: "$spacing$9",
  },
  [`& > ${Text}`]: {
    color: "$gray9",
    fontSize: "$fontSize$3",
    fontWeight: "500",
  },
  "@hover": {
    "&:hover": {
      color: "$hiContrast",
    },
  },

  '&[data-state="active"]': {
    [`& > ${Text}`]: {
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
  "&:focus": {
    outline: "none",
  },
  '&[data-orientation="vertical"]': {
    flexDirection: "column",
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
  },
  '&[data-state="inactive"]': {
    display: "none",
  },
});
