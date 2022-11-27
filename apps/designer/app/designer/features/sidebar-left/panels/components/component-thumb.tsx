import { type Instance, getComponentMeta } from "@webstudio-is/react-sdk";
import { forwardRef, type ElementRef, type ComponentProps } from "react";
import { Flex, Text, styled } from "@webstudio-is/design-system";

const Thumb = styled(Flex, {
  px: "$spacing$3",
  width: 72,
  height: 72,
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
  const { Icon, label } = getComponentMeta(component);
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
      <Text>{label}</Text>
    </Thumb>
  );
});

ComponentThumb.displayName = "ComponentThumb";
