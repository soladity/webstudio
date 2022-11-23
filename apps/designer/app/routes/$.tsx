import {
  redirect,
  json,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

type Data =
  | (CanvasData & { env: Env; mode: BuildMode })
  | { errors: string; env: Env };

export const dynamicLinks: DynamicLinksFunction<CanvasData> = ({
  data,
  location,
}) => {
  const searchParams = new URLSearchParams(location.search);
  searchParams.set("pageId", data.page.id);
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
  if ("errors" in data) {
    return { title: "Error" };
  }
  const { page } = data;
  return { title: page.title, ...page.meta };
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<Data | Response> => {
  try {
    const buildParams = getBuildParams(request);

    if (buildParams === undefined) {
      return redirect(dashboardPath());
    }

    const { mode, pathname } = buildParams;

    const project = await db.project.loadByParams(buildParams);

    if (project === null) {
      throw json("Project not found", { status: 404 });
    }

    const canvasData = await loadCanvasData(
      project,
      mode === "published" ? "prod" : "dev",
      pathname
    );

    if (canvasData === undefined) {
      throw json("Page not found", { status: 404 });
    }

    return { ...canvasData, env, mode };
  } catch (error) {
    // If a Response is thrown, we're rethrowing it for Remix to handle.
    // https://remix.run/docs/en/v1/api/conventions#throwing-responses-in-loaders
    if (error instanceof Response) {
      throw error;
    }

    sentryException({ error });
    return {
      errors: error instanceof Error ? error.message : String(error),
      env,
    };
  }
};

const Content = () => {
  const data = useLoaderData<Data>();

  if ("errors" in data) {
    return <ErrorMessage message={data.errors} />;
  }

  const Outlet =
    data.mode === "edit"
      ? () => <Canvas data={data} />
      : () => <InstanceRoot data={data} />;

  // @todo This is non-standard for Remix, is there a better way?
  // Maybe there is a way to tell remix to use the right outlet somehow and avoid passing it?
  return <Root Outlet={Outlet} />;
};

export default Content;
