// Our root outlet doesn't contain a layout because we have 2 types of documents: canvas and builder and we need to decide down the line which one to render, thre is no single root document.
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Outlet } from "@remix-run/react";
import { setEnv } from "@webstudio-is/feature-flags";
import { withSentry } from "@sentry/remix";
import { ErrorBoundary } from "@sentry/remix";
import env from "./shared/env";
import type { ComponentProps } from "react";

setEnv(env.FEATURES as string);

type OutletProps = ComponentProps<typeof Outlet>;

const RootWithErrorBoundary = (props: OutletProps) => (
  <ErrorBoundary>
    <TooltipProvider>
      <Outlet {...props} />
    </TooltipProvider>
  </ErrorBoundary>
);

export default withSentry(
  // withSentryRouteTracing() expects a type from component that is not necessary true.
  RootWithErrorBoundary as () => JSX.Element
);
