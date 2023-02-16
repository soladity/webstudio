import type { CanvasData, Project } from "@webstudio-is/project";
import {
  loadBuildByProjectId,
  loadTreeById,
} from "@webstudio-is/project-build/server";
import { db as projectDb } from "@webstudio-is/project/server";
import { loadByProject } from "@webstudio-is/asset-uploader/server";
import type { AppContext } from "@webstudio-is/trpc-interface/server";
import { findPageByIdOrPath } from "@webstudio-is/project-build";

export const loadProductionCanvasData = async (
  props: {
    projectId: Project["id"];
  },
  context: AppContext
): Promise<CanvasData[]> => {
  const pagesCanvasData: CanvasData[] = [];

  const prodBuild = await loadBuildByProjectId(props.projectId, "prod");
  if (prodBuild === undefined) {
    throw new Error(
      `Project ${props.projectId} not found or not published yet. Please contact us to get help.`
    );
  }
  const {
    pages: { homePage, pages: otherPages },
  } = prodBuild;
  const project = await projectDb.project.loadByParams(
    { projectId: props.projectId },
    context
  );
  if (project === null) {
    throw new Error("Project not found");
  }
  const canvasData = await loadCanvasData(
    {
      project,
      env: "prod",
      pageIdOrPath: homePage.path,
    },
    context
  );

  pagesCanvasData.push(canvasData);

  if (otherPages.length > 0) {
    for (const page of otherPages) {
      const canvasData = await loadCanvasData(
        { project, env: "prod", pageIdOrPath: page.path },
        context
      );
      pagesCanvasData.push(canvasData);
    }
  }

  return pagesCanvasData;
};

export const loadCanvasData = async (
  props: {
    project: Project;
    env: "dev" | "prod";
    pageIdOrPath: string;
  },
  context: AppContext
): Promise<CanvasData> => {
  const build =
    props.env === "dev"
      ? await loadBuildByProjectId(props.project.id, "dev")
      : await loadBuildByProjectId(props.project.id, "prod");

  if (build === undefined) {
    throw new Error("The project is not published");
  }

  const page = findPageByIdOrPath(build.pages, props.pageIdOrPath);

  if (page === undefined) {
    throw new Error(`Page ${props.pageIdOrPath} not found`);
  }

  const [tree, assets] = await Promise.all([
    loadTreeById(
      {
        projectId: props.project.id,
        treeId: page.treeId,
      },
      context
    ),

    loadByProject(props.project.id, context),
  ]);

  if (tree === null) {
    throw new Error(`Tree not found for project ${props.project.id}`);
  }

  return {
    build,
    tree,
    buildId: build.id,
    page,
    assets,
  };
};
