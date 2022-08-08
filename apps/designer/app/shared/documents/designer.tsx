import { Links, LiveReload, Meta, Outlet, Scripts } from "@remix-run/react";
import { CriticalCss } from "@webstudio-is/react-sdk";
import { Toaster } from "@webstudio-is/design-system";
import { Env } from "~/shared/env";
import { useThemeProps } from "~/shared/theme";

export const Designer = () => {
  const themeProps = useThemeProps();
  return (
    <html lang="en" {...themeProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <CriticalCss />
      </head>
      <body>
        <Outlet />
        <Env />
        <Scripts />
        <Toaster />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
};
