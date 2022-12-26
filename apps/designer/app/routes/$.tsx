import { redirect, json, LoaderArgs } from "@remix-run/node";
import type { MetaFunction, ErrorBoundaryComponent } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import djb2a from "djb2a";
import { InstanceRoot, Root } from "@webstudio-is/react-sdk";
import { loadCanvasData } from "~/shared/db";
import env, { type Env } from "~/env.server";
import { sentryException } from "~/shared/sentry";
import { Canvas } from "~/canvas";
import { ErrorMessage } from "~/shared/error";
import {
  type BuildMode,
  getBuildParams,
  dashboardPath,
} from "~/shared/router-utils";
import { db } from "@webstudio-is/project/server";
import type { DynamicLinksFunction } from "remix-utils";
import type { CanvasData } from "@webstudio-is/project";
import { customComponents } from "~/canvas/custom-components";

type Data = CanvasData & { env: Env; mode: BuildMode };

export const dynamicLinks: DynamicLinksFunction<CanvasData> = ({
  data,
  location,
}) => {
  const searchParams = new URLSearchParams(location.search);
  searchParams.set("pageId", data.page.id);

  // Break cache in case of css has changed
  const cssHash = djb2a(JSON.stringify(data.tree));
  searchParams.set("css-hash", `${cssHash}`);

  return [
    {
      rel: "stylesheet",
      href: `/s/css/?${searchParams}`,
      "data-webstudio": "ssr",
    },
  ];
};

export const handle = { dynamicLinks };

export const meta: MetaFunction = ({ data }: { data: Data }) => {
  const { page } = data;
  return { title: page.title, ...page.meta };
};

export const loader = async ({ request }: LoaderArgs): Promise<Data> => {
  const buildParams = getBuildParams(request);

  if (buildParams === undefined) {
    throw redirect(dashboardPath());
  }

  const { mode } = buildParams;

  const project = await db.project.loadByParams(buildParams);

  if (project === null) {
    throw json("Project not found", { status: 404 });
  }

  const canvasData = await loadCanvasData(
    project,
    mode === "published" ? "prod" : "dev",
    "pageId" in buildParams ? buildParams.pageId : buildParams.pagePath
  );

  if (canvasData === undefined) {
    throw json("Page not found", { status: 404 });
  }

  const params: CanvasData["params"] = {};

  if (env.RESIZE_ORIGIN != null) {
    params.resizeOrigin = env.RESIZE_ORIGIN;
  }

  return { ...canvasData, env, mode, params };
};

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  sentryException({ error });
  const message = error instanceof Error ? error.message : String(error);
  return <ErrorMessage message={message} />;
};

const Content = () => {
  const data = useLoaderData<Data>();

  const Outlet =
    data.mode === "edit"
      ? () => <Canvas data={data} />
      : () => <InstanceRoot data={data} customComponents={customComponents} />;

  // @todo This is non-standard for Remix, is there a better way?
  // Maybe there is a way to tell remix to use the right outlet somehow and avoid passing it?
  return <Root Outlet={Outlet} />;
};

export default Content;
