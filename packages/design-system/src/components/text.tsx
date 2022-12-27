import { css, styled } from "../stitches.config";

export const textStyles = css({
  // Reset
  margin: 0,
  lineHeight: 1,
  userSelect: "none",
  fontFamily: "$sans",

  variants: {
    variant: {
      regular: {
        fontWeight: 400,
        fontSize: "$fontSize$3",
        letterSpacing: "0.005em",
      },
      label: {
        fontWeight: 500,
        fontSize: "$fontSize$3",
        letterSpacing: "0.005em",
      },
      tiny: {
        fontWeight: 400,
        fontSize: "$fontSize$1",
        letterSpacing: "0.01em",
      },
      title: {
        fontWeight: 700,
        fontSize: "$fontSize$3",
        letterSpacing: "0.01em",
      },
      mono: {
        fontFamily: "$mono",
        fontWeight: 400,
        fontSize: "$fontSize$3",
        textTransform: "uppercase",
      },
      unit: {
        fontWeight: 500,
        fontSize: "$fontSize$2",
        textTransform: "uppercase",
      },
    },
    color: {
      contrast: {
        color: "$hiContrast",
      },
      loContrast: {
        color: "$loContrast",
      },
      hint: {
        color: "$hint",
      },
      error: {
        color: "$red10",
      },
    },
    align: {
      left: {
        textAlign: "left",
      },
      center: {
        textAlign: "center",
      },
      right: {
        textAlign: "right",
      },
    },
    truncate: {
      true: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",

        // To make sure text is not clipped vertically
        pt: "0.5em",
        pb: "0.5em",
        mt: "-0.5em",
        mb: "-0.5em",

        flexBasis: 0,
        flexGrow: 1,
      },
    },
  },

  defaultVariants: {
    variant: "regular",
  },
});

/**
 * For use as a standalone, single-line text element. If you need a multiline element - use Paragraph.
 */
export const Text = styled("div", textStyles);
