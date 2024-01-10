/**
 * Implementation of the "Text Area" component from:
 * https://www.figma.com/file/sfCE7iLS0k25qCxiifQNLE/%F0%9F%93%9A-Webstudio-Library?node-id=4-3389
 */

import { type ComponentProps, type Ref, forwardRef } from "react";
import { type CSS, css, theme } from "../stitches.config";
import { textVariants } from "./text";
import { Grid } from "./grid";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { ScrollArea } from "./scroll-area";

const LINE_HEIGHT = 16;
const PADDING_TOP = 6;
const PADDING_BOTTOM = 4;
const BORDER = 1;

const gridStyle = css({
  color: theme.colors.foregroundMain,
  borderRadius: theme.borderRadius[4],
  border: `${BORDER}px solid ${theme.colors.borderMain}`,
  background: theme.colors.backgroundControls,
  paddingTop: PADDING_TOP,
  paddingBottom: PADDING_BOTTOM,
  boxSizing: "border-box",
  resize: "vertical",
  overflow: "auto",
  width: "100%",

  "&:focus-within": {
    borderColor: theme.colors.borderFocus,
    outline: `1px solid ${theme.colors.borderFocus}`,
  },
  "&:has(textarea:disabled)": {
    background: theme.colors.backgroundInputDisabled,
  },
  variants: {
    autoGrow: {
      true: {
        resize: "none",
      },
    },
    variant: {
      regular: textVariants.regular,
      mono: textVariants.mono,
    },
    state: {
      invalid: {
        color: theme.colors.foregroundDestructive,
        "&:not(:disabled):not(:focus-within)": {
          borderColor: theme.colors.borderDestructiveMain,
        },
      },
    },
  },
  defaultVariants: {
    variant: "regular",
  },
});

const commonStyle = css({
  border: "none",
  paddingRight: theme.spacing[4],
  paddingLeft: theme.spacing[3],
  paddingTop: 0,
  paddingBottom: 0,
  boxSizing: "border-box",
  gridArea: "1 / 1 / 2 / 2",
  background: "transparent",
  color: "inherit",
  textWrap: "wrap",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  resize: "none",
  outline: "none",
  "&::placeholder": {
    color: theme.colors.foregroundContrastSubtle,
  },
  "&:disabled": {
    color: theme.colors.foregroundDisabled,
  },
  variants: {
    variant: {
      regular: textVariants.regular,
      mono: textVariants.mono,
    },
  },
  defaultVariants: {
    variant: "regular",
  },
});

const textAreaStyle = css(commonStyle, {});

type Props = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> & {
  css?: CSS;
  rows?: number;
  maxRows?: number;
  state?: "invalid";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  autoGrow?: boolean;
  variant?: "regular" | "mono";
};

export const TextArea = forwardRef(
  (
    {
      css,
      className,
      rows = 3,
      maxRows,
      state,
      value,
      onChange,
      autoGrow,
      variant = "regular",
      ...props
    }: Props,
    ref: Ref<HTMLTextAreaElement>
  ) => {
    const [textValue, setTextValue] = useControllableState({
      prop: value,
      defaultProp: props.defaultValue,
      onChange,
    });

    // We could use `box-sizing:content-box` to avoid dealing with paddings and border here
    // But then, the user of the component will not be able to set `width` reliably
    const minHeight =
      rows * LINE_HEIGHT + PADDING_TOP + PADDING_BOTTOM + BORDER * 2;

    const height = autoGrow ? undefined : minHeight;

    const maxHeight = maxRows
      ? maxRows * LINE_HEIGHT + PADDING_TOP + PADDING_BOTTOM + BORDER * 2
      : undefined;

    return (
      <Grid
        className={gridStyle({
          state,
          autoGrow,
          variant,
          css: { height, minHeight, maxHeight },
        })}
        onClick={(event) => {
          if (event.target instanceof HTMLElement) {
            // Focus textarea on click since it can't match parent height.
            const textarea = event.target.querySelector("textarea");
            if (textarea) {
              textarea.focus();
            }
          }
        }}
      >
        <ScrollArea
          css={{
            height: "100%",
            maxHeight: maxRows ? maxRows * LINE_HEIGHT : undefined,
            // Overwrite hack from scroll-area.tsx
            "& [data-radix-scroll-area-viewport] > div": {
              display: "grid!important",
            },
          }}
        >
          <div
            className={commonStyle({
              css: { visibility: "hidden", ...css },
              state,
              className,
              variant,
            })}
          >
            {textValue}{" "}
          </div>

          <textarea
            spellCheck={false}
            className={textAreaStyle({
              css,
              state,
              className,
              variant,
            })}
            onChange={(event) => setTextValue(event.target.value)}
            value={textValue}
            rows={rows}
            ref={ref}
            {...props}
          />
        </ScrollArea>
      </Grid>
    );
  }
);
TextArea.displayName = "TextArea";
