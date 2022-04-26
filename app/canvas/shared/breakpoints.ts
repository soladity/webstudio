import { useEffect } from "react";
import store from "immerhin";
import {
  type Breakpoint,
  useSubscribe,
  setBreakpoints,
} from "@webstudio-is/sdk";
import { useBreakpoints, breakpointsContainer } from "./nano-values";
import { publish } from "./pubsub";

store.register("breakpoints", breakpointsContainer);

export const useInitializeBreakpoints = (breakpoints: Array<Breakpoint>) => {
  const [, setCurrentBreakpoints] = useBreakpoints();
  useEffect(() => {
    setBreakpoints(breakpoints);
    setCurrentBreakpoints(breakpoints);
  }, [breakpoints, setCurrentBreakpoints]);
};

const usePublishBreakpoints = () => {
  const [breakpoints] = useBreakpoints();
  useEffect(() => {
    publish<"loadBreakpoints", Array<Breakpoint>>({
      type: "loadBreakpoints",
      payload: breakpoints,
    });
  }, [breakpoints]);
};

const useBreakpointChange = () => {
  useSubscribe<"breakpointChange", Breakpoint>(
    "breakpointChange",
    (breakpoint) => {
      store.createTransaction([breakpointsContainer], (breakpoints) => {
        const foundBreakpoint = breakpoints.find(
          ({ id }) => id == breakpoint.id
        );
        if (foundBreakpoint) {
          foundBreakpoint.label = breakpoint.label;
          foundBreakpoint.minWidth = breakpoint.minWidth;
          return;
        }
        // Its a new breakpoint
        breakpoints.push(breakpoint);
      });
    }
  );
};

const useBreakpointDelete = () => {
  useSubscribe<"breakpointDelete", Breakpoint>(
    "breakpointDelete",
    (breakpoint) => {
      store.createTransaction([breakpointsContainer], (breakpoints) => {
        const index = breakpoints.findIndex(({ id }) => id == breakpoint.id);
        if (index !== -1) {
          breakpoints.splice(index, 1);
        }
      });
    }
  );
};

export const useHandleBreakpoints = () => {
  usePublishBreakpoints();
  useBreakpointChange();
  useBreakpointDelete();
};
