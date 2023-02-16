import { Links, Meta, Outlet as DefaultOutlet } from "@remix-run/react";

/**
 * We are using Outlet prop from index layout when user renders site from a subdomain.
 */
export const Root = ({
  Outlet = DefaultOutlet,
}: {
  Outlet: typeof DefaultOutlet;
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <Meta />
        <Links />
      </head>

      <Outlet />
    </html>
  );
};
