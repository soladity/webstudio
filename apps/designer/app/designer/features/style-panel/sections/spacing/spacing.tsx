import { useState } from "react";
import { getFinalValue } from "../../shared/get-final-value";
import { useIsFromCurrentBreakpoint } from "../../shared/use-is-from-current-breakpoint";
import type { RenderCategoryProps } from "../../style-sections";
import { SpacingLayout } from "./layout";
import { ValueText } from "./value-text";
import { useScrub } from "./scrub";
import type {
  StyleChangeHandler,
  SpacingStyleProperty,
  HoverTagret,
} from "./types";
import { InputPopover } from "./input-popover";
import { SpacingTooltip } from "./tooltip";

const Cell = ({
  isPopoverOpen,
  onPopoverClose,
  onChange,
  onHover,
  property,
  isActive,
  scrubStatus,
  currentStyle,
  inheritedStyle,
}: {
  isPopoverOpen: boolean;
  onPopoverClose: () => void;
  onChange: StyleChangeHandler;
  onHover: (target: HoverTagret | undefined) => void;
  property: SpacingStyleProperty;
  isActive: boolean;
  scrubStatus: ReturnType<typeof useScrub>;
} & Pick<RenderCategoryProps, "currentStyle" | "inheritedStyle">) => {
  const isFromCurrentBreakpoint = useIsFromCurrentBreakpoint(property);

  const styleValue = getFinalValue({
    property,
    currentStyle,
    inheritedStyle,
  });

  const finalValue = scrubStatus.isActive ? scrubStatus.value : styleValue;

  // for TypeScript
  if (finalValue === undefined) {
    return null;
  }

  return (
    <>
      <InputPopover
        value={finalValue}
        isOpen={isPopoverOpen}
        property={property}
        onChange={onChange}
        onClose={onPopoverClose}
      />
      <SpacingTooltip
        property={property}
        isOpen={
          isActive && isPopoverOpen === false && scrubStatus.isActive === false
        }
      />
      <ValueText
        css={{
          // We want value to have `default` cursor to indicate that it's clickable,
          // unlike the rest of the value area that has cursor that indicates scrubbing.
          // Click and scrub works everywhere anyway, but we want cursors to be different.
          //
          // In order to have control over cursor we're setting pointerEvents to "all" here
          // because SpacingLayout sets it to "none" for cells' content.
          pointerEvents: "all",
        }}
        value={finalValue}
        isActive={isActive}
        origin={isFromCurrentBreakpoint ? "set" : "unset"}
        onMouseEnter={(event) =>
          onHover({ property, element: event.currentTarget })
        }
        onMouseLeave={() => onHover(undefined)}
      />
    </>
  );
};

export const SpacingSection = ({
  setProperty,
  deleteProperty,
  currentStyle,
  inheritedStyle,
}: RenderCategoryProps) => {
  const [hoverTarget, setHoverTarget] = useState<HoverTagret>();

  const handleChange: StyleChangeHandler = (update, options) => {
    if (update.operation === "set") {
      setProperty(update.property)(update.value, options);
    } else {
      deleteProperty(update.property, options);
    }
  };

  const scrubStatus = useScrub({
    target: hoverTarget,
    onChange: handleChange,
    currentStyle,
    inheritedStyle,
  });

  const [openProperty, setOpenProperty] = useState<SpacingStyleProperty>();

  const activeProperty = scrubStatus.isActive
    ? scrubStatus.property
    : openProperty ?? hoverTarget?.property;

  return (
    <SpacingLayout
      onClick={() => setOpenProperty(hoverTarget?.property)}
      onHover={setHoverTarget}
      activeProperty={activeProperty}
      renderCell={({ property }) => (
        <Cell
          isPopoverOpen={openProperty === property}
          onPopoverClose={() => {
            if (openProperty === property) {
              setOpenProperty(undefined);
            }
          }}
          onChange={handleChange}
          onHover={setHoverTarget}
          property={property}
          scrubStatus={
            scrubStatus.isActive && scrubStatus.property === property
              ? scrubStatus
              : { isActive: false }
          }
          isActive={activeProperty === property}
          currentStyle={currentStyle}
          inheritedStyle={inheritedStyle}
        />
      )}
    />
  );
};
