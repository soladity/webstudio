/**
 * Implementation of the "Menu" and "Menu Item" components from:
 * https://www.figma.com/file/sfCE7iLS0k25qCxiifQNLE/%F0%9F%93%9A-Webstudio-Library?node-id=6%3A2104&t=xHSB8rNf2VXrwLAU-0
 *
 * Only CSS is implemented here, and intended to be used with:
 *  - @radix-ui/react-dropdown-menu
 *  - @radix-ui/react-select
 *  - @radix-ui/react-popper & downshift
 *  - @radix-ui/react-context-menu (@todo, not implemented yet)
 *
 * @todo not implemented yet Figma features:
 *  - Component: "Menu Item Large"
 *  - Type of "Menu" component: "Dropdown w/large items"
 *  - Type of "Menu" component: "Context menu"
 *
 * @todo: group everything under a folder same as floating-panel?
 */

import { css, styled, theme } from "../stitches.config";
import { typography } from "./typography";
import {
  Arrow as BaseDropdownMenuArrow,
  SubContent,
} from "@radix-ui/react-dropdown-menu";
import { type ComponentProps } from "react";

export const labelCss = css(typography.title, {
  color: theme.colors.foregroundMain,
  mx: theme.spacing[3],
  padding: theme.spacing[3],
});

const indicatorSize = theme.spacing[9];
export const itemIndicatorCss = css({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  left: theme.spacing[3],
  width: indicatorSize,
  height: indicatorSize,
});

export const itemCss = css(typography.labelTitleCase, {
  outline: "none",
  cursor: "default",
  position: "relative",
  display: "flex",
  alignItems: "center",
  color: theme.colors.foregroundMain,
  mx: theme.spacing[3],
  padding: theme.spacing[3],
  borderRadius: theme.borderRadius[3],
  "&:focus, &[data-found], &[aria-selected=true], &[data-state=open]": {
    backgroundColor: theme.colors.backgroundItemMenuItemHover,
  },
  "&[data-disabled], &[aria-disabled]": {
    color: theme.colors.foregroundDisabled,
  },
  variants: {
    withIndicator: {
      true: {
        paddingLeft: `calc(${theme.spacing[3]} + ${indicatorSize} + ${theme.spacing[3]})`,
      },
    },
    destructive: {
      true: {
        color: theme.colors.foregroundDestructive,
      },
    },
  },
});

export const separatorCss = css({
  height: 1,
  my: theme.spacing[3],
  backgroundColor: theme.colors.borderMain,
});

const menuPadding = theme.spacing[3];
const menuBorderWidth = "1px";

export const menuCss = css({
  boxSizing: "border-box",

  borderRadius: theme.borderRadius[6],
  backgroundColor: theme.colors.backgroundMenu,

  // in Figma there are 2 borders on two rectangles,
  // but we have only one element to work with,
  // so we implement borders using shadows
  boxShadow: `${theme.shadows.menuDropShadow}, inset 0 0 0 1px ${theme.colors.borderMain}, inset 0 0 0 2px ${theme.colors.borderMenuInner}`,

  // extra 1px padding to account for one of the shadow-borders above
  padding: `calc(${menuBorderWidth} + ${menuPadding}) ${menuBorderWidth}`,

  variants: {
    width: {
      regular: { width: theme.spacing[26] },
    },
  },
});

export const subMenuCss = css(menuCss, {
  // the goal is to align the top menu item in a sub menu
  // with the menu item in the parent menu that opened it
  marginTop: `calc((${menuPadding} + ${menuBorderWidth}) * -1)`,
});

export const subContentProps: Partial<ComponentProps<typeof SubContent>> = {
  // this depends on itemCss.margin and menuCss.padding,
  // the goal is to make sub-menu overlap the parent menu by exactly 2px
  sideOffset: 3,
};

// Arrow is hard to implement with just CSS,
// so we implement it as a component
const ArrowBackground = styled("path", { fill: theme.colors.backgroundMenu });
const ArrowInnerBorder = styled("path", { fill: theme.colors.borderMenuInner });
const ArrowOuterBorder = styled("path", { fill: theme.colors.borderMain });
const ArrowSgv = styled("svg", { transform: "translateY(-3px)" });
export const DropdownMenuArrow = () => (
  <BaseDropdownMenuArrow width={16} height={11} asChild>
    <ArrowSgv xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11">
      <ArrowOuterBorder d="M8.73 9.76a1 1 0 0 1-1.46 0L.5 2.54h15L8.73 9.76Z" />
      <ArrowInnerBorder d="M8.146 8.909a.2.2 0 0 1-.292 0L.5 1.065h15L8.146 8.909Z" />
      <ArrowBackground d="M8.073 7.52a.1.1 0 0 1-.146 0L.877 0h14.246l-7.05 7.52Z" />
    </ArrowSgv>
  </BaseDropdownMenuArrow>
);
