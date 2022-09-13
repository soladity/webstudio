import { type LoaderFunction } from "@remix-run/node";
import type { Tree } from "@webstudio-is/react-sdk";
import * as db from "~/shared/db";

export type ErrorData = {
  errors: string;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<Tree | null | ErrorData> => {
  try {
    if (params.projectId === undefined) {
      throw new Error(`Project ID required`);
    }

    const prodBuild = await db.build.loadProdByProjectId(params.projectId);

    if (prodBuild === undefined) {
      throw new Error(
        `Project ${params.projectId} needs to be published first`
      );
    }

    return await db.tree.loadById(prodBuild.pages.homePage.treeId);
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: error.message,
      };
    }
  }
  return { errors: "Unexpected error" };
};
