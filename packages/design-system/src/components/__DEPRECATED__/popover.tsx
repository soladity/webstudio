import {
  type ComponentProps,
  type ElementRef,
  type ReactNode,
  forwardRef,
} from "react";
import { CrossLargeIcon } from "@webstudio-is/icons";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Box } from "../box";
import { panelStyle } from "../panel";
import { Flex } from "../flex";
import { DeprecatedIconButton } from "./icon-button";
import { DeprecatedText2 } from "./text2";
import { Separator } from "../separator";
import { styled, type CSS } from "../../stitches.config";
import { theme } from "../../stitches.config";

type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root> & {
  children: ReactNode;
};

export const DeprecatedPopover = ({ children, ...props }: PopoverProps) => {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
};

const StyledContent = styled(PopoverPrimitive.Content, panelStyle, {
  backgroundColor: "white",
  minWidth: 200,
  minHeight: theme.spacing[13],
  maxWidth: "max-content",
  "&:focus": {
    outline: "none",
  },
  display: "flex",
  flexDirection: "column",
});

type PopoverContentPrimitiveProps = ComponentProps<
  typeof PopoverPrimitive.Content
>;

type PopoverContentProps = PopoverContentPrimitiveProps & {
  css?: CSS;
  hideArrow?: boolean;
};

export const DeprecatedPopoverContent = forwardRef<
  ElementRef<typeof StyledContent>,
  PopoverContentProps
>(({ children, hideArrow, ...props }, fowardedRef) => (
  <StyledContent
    sideOffset={4}
    collisionPadding={4}
    {...props}
    ref={fowardedRef}
  >
    {children}
    {!hideArrow && (
      <Box css={{ color: theme.colors.panel }}>
        <PopoverPrimitive.Arrow
          width={11}
          height={5}
          offset={5}
          style={{ fill: "currentColor" }}
        />
      </Box>
    )}
  </StyledContent>
));
DeprecatedPopoverContent.displayName = "PopoverContent";

type PopoverHeaderProps = {
  title: string;
};

export const DeprecatedPopoverHeader = ({ title }: PopoverHeaderProps) => {
  return (
    <Box css={{ order: -1 }}>
      <Flex
        css={{ height: 40, paddingLeft: theme.spacing[9] }}
        align="center"
        justify="between"
      >
        <DeprecatedText2 variant="title">{title}</DeprecatedText2>
        <DeprecatedPopoverClose asChild>
          <DeprecatedIconButton
            size="2"
            css={{
              marginRight: theme.spacing[5],
            }}
            aria-label="Close"
          >
            <CrossLargeIcon />
          </DeprecatedIconButton>
        </DeprecatedPopoverClose>
      </Flex>
      <Separator />
    </Box>
  );
};

export const DeprecatedPopoverTrigger = PopoverPrimitive.Trigger;
export const DeprecatedPopoverClose = PopoverPrimitive.Close;
export const DeprecatedPopoverPortal = PopoverPrimitive.Portal;
