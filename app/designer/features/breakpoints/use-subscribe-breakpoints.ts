import { useEffect } from "react";
import { Breakpoint, useSubscribe } from "@webstudio-is/sdk";
import {
  useBreakpoints,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-values";
import { sort } from "~/shared/breakpoints";

export const useSubscribeBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useBreakpoints();
  const [selectedBreakpoint, setSelectedBreakpoint] = useSelectedBreakpoint();

  useSubscribe<"loadBreakpoints", Array<Breakpoint>>(
    "loadBreakpoints",
    setBreakpoints
  );

  useEffect(() => {
    // Set the initial selected breakpoint
    if (selectedBreakpoint === undefined && breakpoints.length !== 0) {
      setSelectedBreakpoint(sort(breakpoints)[0]);
    }

    // Breakpoints must have changed, lets update the selected breakpoint
    if (
      selectedBreakpoint !== undefined &&
      breakpoints.includes(selectedBreakpoint) === false
    ) {
      const nextSelectedBreakpoint = breakpoints.find(
        (breakpoint) => breakpoint.id === selectedBreakpoint.id
      );
      if (nextSelectedBreakpoint !== undefined)
        setSelectedBreakpoint(nextSelectedBreakpoint);
    }
  }, [breakpoints, selectedBreakpoint, setSelectedBreakpoint]);
};
