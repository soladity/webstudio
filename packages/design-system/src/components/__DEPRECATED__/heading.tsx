import { type ComponentProps, type ElementRef, forwardRef } from "react";
import { DeprecatedText } from "./text";
import type { VariantProps, CSS } from "../../stitches.config";
import merge from "lodash.merge";

const DEFAULT_TAG = "h1";

type TextSizeVariants = Pick<VariantProps<typeof DeprecatedText>, "size">;
type HeadingSizeVariants = "1" | "2" | "3" | "4";
type HeadingVariants = { size?: HeadingSizeVariants } & Omit<
  VariantProps<typeof DeprecatedText>,
  "size"
>;
type HeadingProps = ComponentProps<typeof DEFAULT_TAG> &
  HeadingVariants & { css?: CSS; as?: string };

export const DeprecatedHeading = forwardRef<
  ElementRef<typeof DEFAULT_TAG>,
  HeadingProps
>((props, forwardedRef) => {
  // '2' here is the default heading size variant
  const { size = "1", ...textProps } = props;
  // This is the mapping of Heading Variants to Text variants
  const textSize: Record<HeadingSizeVariants, TextSizeVariants["size"]> = {
    1: { "@initial": "4", "@laptop": "5" },
    2: { "@initial": "6", "@laptop": "7" },
    3: { "@initial": "7", "@laptop": "8" },
    4: { "@initial": "8", "@laptop": "9" },
  };

  // This is the mapping of Heading Variants to Text css
  const textCss: Record<HeadingSizeVariants, CSS> = {
    1: {
      fontWeight: 500,
      lineHeight: "16px",
      "@laptop": { lineHeight: "23px" },
    },
    2: {
      fontWeight: 500,
      lineHeight: "25px",
      "@laptop": { lineHeight: "30px" },
    },
    3: {
      fontWeight: 500,
      lineHeight: "33px",
      "@laptop": { lineHeight: "41px" },
    },
    4: {
      fontWeight: 500,
      lineHeight: "35px",
      "@laptop": { lineHeight: "55px" },
    },
  };

  return (
    <DeprecatedText
      as={DEFAULT_TAG}
      {...textProps}
      ref={forwardedRef}
      size={textSize[size]}
      css={{
        fontVariantNumeric: "proportional-nums",
        ...merge(textCss[size], props.css),
      }}
    />
  );
});

DeprecatedHeading.displayName = "DeprecatedHeading";
