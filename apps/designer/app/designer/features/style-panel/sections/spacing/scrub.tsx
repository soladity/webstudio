import type { StyleValue, UnitValue } from "@webstudio-is/css-data";
import { numericScrubControl } from "@webstudio-is/design-system";
import { useState, useEffect, useRef } from "react";
import type {
  StyleChangeHandler,
  SpacingStyleProperty,
  HoverTagret,
} from "./types";

type ScrubStatus =
  | { isActive: false }
  | { isActive: true; property: SpacingStyleProperty; value: UnitValue };

export const useScrub = (props: {
  value?: StyleValue;
  target: HoverTagret | undefined;
  onChange: StyleChangeHandler;
}): ScrubStatus => {
  // we want to hold on to the target while scrub is active even if hover changes
  const [activeTarget, setActiveTarget] = useState<HoverTagret>();
  const finalTarget = activeTarget ?? props.target;

  const [value, setValue] = useState<UnitValue>();

  // we need this in useEffect, but don't want it as a dependency
  const latestProps = useRef(props);
  latestProps.current = props;

  const unitRef = useRef<UnitValue["unit"]>();

  useEffect(() => {
    if (finalTarget === undefined) {
      return;
    }

    const property = finalTarget.property;

    const scrub = numericScrubControl(finalTarget.element, {
      direction:
        property.endsWith("Left") || property.endsWith("Right")
          ? "horizontal"
          : "vertical",
      getValue() {
        const { value } = latestProps.current;
        if (value?.type === "unit") {
          unitRef.current = value.unit;
          return value.value;
        }
      },
      onValueInput(event) {
        // for TypeScript
        if (unitRef.current === undefined) {
          return;
        }

        const value = {
          type: "unit",
          value: event.value,
          unit: unitRef.current,
        } as const;

        setValue(value);
        latestProps.current.onChange(
          { operation: "set", property, value },
          { isEphemeral: true }
        );
      },
      onValueChange(event) {
        // for TypeScript
        if (unitRef.current === undefined) {
          return;
        }

        const value = {
          type: "unit",
          value: event.value,
          unit: unitRef.current,
        } as const;

        latestProps.current.onChange(
          { operation: "set", property, value },
          { isEphemeral: false }
        );
      },
      onStatusChange(status) {
        setActiveTarget(
          status === "scrubbing" ? latestProps.current.target : undefined
        );
      },
    });

    return scrub.disconnectedCallback;
  }, [finalTarget]);

  return activeTarget === undefined || value === undefined
    ? { isActive: false }
    : { isActive: true, property: activeTarget.property, value };
};
