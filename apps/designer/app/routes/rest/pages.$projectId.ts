import type { LoaderFunction } from "@remix-run/node";
import type { Breakpoint } from "@webstudio-is/react-sdk";
import * as db from "~/shared/db";

export type ErrorData = {
  errors: string;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<Array<Breakpoint> | ErrorData> => {
  try {
    const project = await db.project.loadById(params.projectId);
    if (project === null) {
      throw new Error(`Project ${params.projectId} not found`);
    }

    const prodBuild = await db.build.loadProdByProjectId(project.id);

    if (prodBuild === undefined) {
      throw new Error(
        `Project ${params.projectId} needs to be published first`
      );
    }
    const data = await db.breakpoints.load(prodBuild.pages.homePage.treeId);
    if (data === null) {
      throw new Error(
        `Breakpoints not found for project ${params.projectId} and tree ID ${prodBuild.pages.homePage.treeId}`
      );
    }
    return data.values;
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: error.message,
      };
    }
  }
  return { errors: "Unexpected error" };
};
