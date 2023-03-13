/**
 * Implementation of the "Label" component from:
 * https://www.figma.com/file/sfCE7iLS0k25qCxiifQNLE/%F0%9F%93%9A-Webstudio-Library?node-id=4%3A3274
 */

import type { ComponentProps, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import { textVariants } from "./text";
import { styled, theme } from "../stitches.config";

export const labelColors = ["default", "preset", "local", "remote"] as const;

const StyledLabel = styled("label", textVariants.labelsSentenceCase, {
  boxSizing: "border-box",
  flexShrink: 0,
  py: theme.spacing[1],
  border: "1px solid transparent",
  borderRadius: theme.borderRadius[3],

  "&:focus-visible": {
    outline: `2px solid ${theme.colors.blue10}`,
  },

  "&[aria-disabled=true]": {
    color: theme.colors.foregroundDisabled,
  },

  variants: {
    color: {
      default: {
        color: theme.colors.foregroundMain,
      },
      preset: {
        px: theme.spacing[3],
        backgroundColor: theme.colors.backgroundPresetMain,
        borderColor: theme.colors.borderMain,
        color: theme.colors.foregroundMain,
        "&:hover": {
          backgroundColor: theme.colors.backgroundPresetHover,
        },
      },
      local: {
        px: theme.spacing[3],
        backgroundColor: theme.colors.backgroundSetMain,
        borderColor: theme.colors.borderSetMain,
        color: theme.colors.foregroundSetMain,
        "&:hover": {
          backgroundColor: theme.colors.backgroundSetHover,
        },
      },
      remote: {
        px: theme.spacing[3],
        backgroundColor: theme.colors.backgroundInheritedMain,
        borderColor: theme.colors.borderInheritedMain,
        color: theme.colors.foregroundInheritedMain,
        "&:hover": {
          backgroundColor: theme.colors.backgroundInheritedHover,
        },
      },
    },
    truncate: {
      true: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flexBasis: 0,
        flexGrow: 1,
      },
    },
  },

  defaultVariants: {
    color: "default",
  },
});

type Props = ComponentProps<typeof StyledLabel> & {
  color?: (typeof labelColors)[number];
  disabled?: boolean;
  truncate?: boolean;
  children: ReactNode;
};

export const Label = forwardRef((props: Props, ref: Ref<HTMLLabelElement>) => {
  const { disabled, children, ...rest } = props;
  return (
    <StyledLabel ref={ref} aria-disabled={disabled} {...rest}>
      {children}
    </StyledLabel>
  );
});

Label.displayName = "Label";
