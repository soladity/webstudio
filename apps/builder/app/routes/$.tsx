import { redirect } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { type Params, Root } from "@webstudio-is/react-sdk";
import env from "~/env/env.public.server";
import { sentryException } from "~/shared/sentry";
import { Canvas } from "~/canvas";
import { ErrorMessage } from "~/shared/error";
import { getBuildParams, dashboardPath } from "~/shared/router-utils";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  // See remix.config.ts for the publicPath value
  const publicPath = "/build/";

  // In case of 404 on static assets, this route will be executed
  if (url.pathname.startsWith(publicPath)) {
    throw new Response("Not found", {
      status: 404,
    });
  }

  const buildParams = getBuildParams(request);
  if (buildParams === undefined) {
    throw redirect(dashboardPath());
  }

  const params: Params = {
    imageBaseUrl: env.IMAGE_BASE_URL,
    assetBaseUrl: env.ASSET_BASE_URL,
  };

  return { params };
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  sentryException({ error });
  const message = isRouteErrorResponse(error)
    ? error.data.message ?? error.data
    : error instanceof Error
    ? error.message
    : String(error);

  return <ErrorMessage message={message} />;
};

const Outlet = () => {
  const { params } = useLoaderData<typeof loader>();
  return <Canvas params={params} />;
};

/**
 * @todo add support for published site on localhost
 * consider switching current route to something like /canvas
 */

const Content = () => {
  // @todo This is non-standard for Remix, is there a better way?
  // Maybe there is a way to tell remix to use the right outlet somehow and avoid passing it?
  return <Root Outlet={Outlet} />;
};

export default Content;
