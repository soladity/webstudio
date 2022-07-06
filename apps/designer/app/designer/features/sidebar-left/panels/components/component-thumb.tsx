import { type Instance } from "@webstudio-is/sdk";
import { forwardRef, type ElementRef, type ComponentProps } from "react";
import { primitives } from "~/shared/canvas-components";
import { Flex, Text, styled } from "~/shared/design-system";

const Thumb = styled(Flex, {
  px: 5,
  width: 75,
  height: 75,
  border: "1px solid $slate6",
  userSelect: "none",
  color: "$hiContrast",
  cursor: "grab",
  "&:hover": {
    background: "$slate3",
  },
  variants: {
    state: {
      dragging: {
        background: "$slate3",
      },
    },
  },
});

type ComponentThumbProps = {
  component: Instance["component"];
} & ComponentProps<typeof Thumb>;

export const ComponentThumb = forwardRef<
  ElementRef<typeof Thumb>,
  ComponentThumbProps
>(({ component, ...rest }, ref) => {
  const { Icon, label } = primitives[component];
  return (
    <Thumb
      direction="column"
      align="center"
      justify="center"
      gap="3"
      ref={ref}
      {...rest}
    >
      <Icon width={30} height={30} />
      <Text size="1">{label}</Text>
    </Thumb>
  );
});

ComponentThumb.displayName = "ComponentThumb";
