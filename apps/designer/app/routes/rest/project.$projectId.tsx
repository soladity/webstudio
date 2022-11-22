import { ActionFunction, json } from "@remix-run/node";
import env from "~/env.server";
import { db } from "@webstudio-is/project/server";
import { sentryException } from "~/shared/sentry";
import { generateCssText } from "~/shared/css-utils";
import type { Props, Tree } from "@webstudio-is/react-sdk";
import type { Page } from "@webstudio-is/project";

type PagesDetails = {
  [key: string]: {
    page: Page;
    tree: Tree | null;
    props: Props[];
    css: string;
  };
};
export const loader: ActionFunction = async ({ request, params }) => {
  try {
    const projectId = params.projectId ?? undefined;
    const url = new URL(request.url);
    const pagesDetails: PagesDetails = {};

    if (projectId === undefined) {
      throw json("Required project id", { status: 400 });
    }

    const prodBuild = await db.build.loadByProjectId(projectId, "prod");
    if (prodBuild === undefined) {
      throw json(
        "Project not found or not published yet. Please contact us to get help.",
        { status: 500 }
      );
    }
    const {
      pages: { homePage, pages },
    } = prodBuild;
    const breakpoints = await db.breakpoints.load(prodBuild.id);
    pagesDetails["/"] = {
      page: homePage,
      tree: await db.tree.loadById(homePage.treeId),
      props: await db.props.loadByTreeId(homePage.treeId),
      css: await generateCssText({
        projectId,
        mode: "published",
        pathname: url.pathname,
        pageId: homePage.id,
      }),
    };

    if (pages.length > 0) {
      for (const page of pages) {
        pagesDetails[page.path] = {
          page,
          tree: await db.tree.loadById(page.treeId),
          props: await db.props.loadByTreeId(page.treeId),
          css: await generateCssText({
            projectId,
            mode: "published",
            pathname: page.path,
            pageId: page.id,
          }),
        };
      }
    }
    return { pages: pagesDetails, breakpoints };
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
