import { v4 as uuid } from "uuid";
import {
  prisma,
  Build as DbBuild,
  Prisma,
  Project,
} from "@webstudio-is/prisma-client";
import { Breakpoints } from "@webstudio-is/css-data";
import { StyleSources } from "@webstudio-is/project-build";
import * as db from ".";
import { Build, Page, Pages } from "../shared/schema";
import * as pagesUtils from "../shared/pages";
import { parseStyles, serializeStyles } from "./styles";

export const parseBuild = async (build: DbBuild): Promise<Build> => {
  const pages = Pages.parse(JSON.parse(build.pages));
  return {
    id: build.id,
    projectId: build.projectId,
    isDev: build.isDev,
    isProd: build.isProd,
    createdAt: build.createdAt.toISOString(),
    pages,
    breakpoints: Breakpoints.parse(JSON.parse(build.breakpoints)),
    styles: await parseStyles(build.styles),
    styleSources: StyleSources.parse(JSON.parse(build.styleSources)),
  };
};

export const loadById = async ({
  projectId,
  buildId,
}: {
  projectId: Project["id"];
  buildId: Build["id"];
}): Promise<Build> => {
  const build = await prisma.build.findUnique({
    where: {
      id_projectId: { projectId, id: buildId },
    },
  });

  if (build === null) {
    throw new Error("Build not found");
  }

  return parseBuild(build);
};

export async function loadByProjectId(
  projectId: Build["projectId"],
  env: "dev"
): Promise<Build>;
export async function loadByProjectId(
  projectId: Build["projectId"],
  env: "prod"
): Promise<Build | undefined>;
// eslint-disable-next-line func-style
export async function loadByProjectId(
  projectId: Build["projectId"],
  env: "prod" | "dev"
): Promise<Build | undefined> {
  if (env === "dev") {
    const build = await prisma.build.findFirst({
      where: { projectId, isDev: true },
    });

    if (build === null) {
      throw new Error("Dev build not found");
    }

    return parseBuild(build);
  }

  const build = await prisma.build.findFirst({
    where: { projectId, isProd: true },
  });

  if (build === null) {
    return;
  }

  return parseBuild(build);
}

const updatePages = async (
  { projectId, buildId }: { projectId: Project["id"]; buildId: Build["id"] },
  updater: (currentPages: Pages) => Promise<Pages>
) => {
  const build = await loadById({ projectId, buildId });
  const updatedPages = Pages.parse(await updater(build.pages));
  const updatedBuild = await prisma.build.update({
    where: {
      id_projectId: { projectId, id: buildId },
    },
    data: {
      pages: JSON.stringify(updatedPages),
    },
  });
  return parseBuild(updatedBuild);
};

export const addPage = async ({
  projectId,
  buildId,
  data,
}: {
  projectId: Project["id"];
  buildId: Build["id"];
  data: Pick<Page, "name" | "path"> &
    Partial<Omit<Page, "id" | "treeId" | "name" | "path">>;
}) => {
  return updatePages({ projectId, buildId }, async (currentPages) => {
    const tree = await db.tree.create(
      db.tree.createTree({ projectId, buildId })
    );

    return {
      homePage: currentPages.homePage,
      pages: [
        ...currentPages.pages,
        {
          id: uuid(),
          treeId: tree.id,
          name: data.name,
          path: data.path,
          title: data.title ?? data.name,
          meta: data.meta ?? {},
        },
      ],
    };
  });
};

export const editPage = async ({
  projectId,
  buildId,
  pageId,
  data,
}: {
  projectId: Project["id"];
  buildId: Build["id"];
  pageId: Page["id"];
  data: Partial<Omit<Page, "id" | "treeId">>;
}) => {
  return updatePages({ projectId, buildId }, async (currentPages) => {
    const currentPage = pagesUtils.findByIdOrPath(currentPages, pageId);
    if (currentPage === undefined) {
      throw new Error(`Page with id "${pageId}" not found`);
    }

    const updatedPage: Page = {
      id: currentPage.id,
      treeId: currentPage.treeId,
      name: data.name ?? currentPage.name,
      path: data.path ?? currentPage.path,
      title: data.title ?? currentPage.title,
      meta: { ...currentPage.meta, ...data.meta },
    };

    return {
      homePage:
        updatedPage.id === currentPages.homePage.id
          ? updatedPage
          : currentPages.homePage,
      pages: currentPages.pages.map((page) =>
        page.id === updatedPage.id ? updatedPage : page
      ),
    };
  });
};

export const deletePage = async ({
  projectId,
  buildId,
  pageId,
}: {
  projectId: Project["id"];
  buildId: Build["id"];
  pageId: Page["id"];
}) => {
  return updatePages({ projectId, buildId }, async (currentPages) => {
    if (pageId === currentPages.homePage.id) {
      throw new Error("Cannot delete home page");
    }

    const page = pagesUtils.findByIdOrPath(currentPages, pageId);
    if (page === undefined) {
      throw new Error(`Page with id "${pageId}" not found`);
    }

    await db.tree.deleteById({ projectId, treeId: page.treeId });

    return {
      homePage: currentPages.homePage,
      pages: currentPages.pages.filter((page) => page.id !== pageId),
    };
  });
};

const createPages = async (
  { projectId, buildId }: { projectId: Project["id"]; buildId: Build["id"] },
  client: Prisma.TransactionClient = prisma
) => {
  const tree = await db.tree.create(
    db.tree.createTree({ projectId, buildId }),
    client
  );
  return Pages.parse({
    homePage: {
      id: uuid(),
      name: "Home",
      path: "",
      title: "Home",
      meta: {},
      treeId: tree.id,
    },
    pages: [],
  });
};

const clonePage = async (
  { projectId, source }: { projectId: Project["id"]; source: Page },
  client: Prisma.TransactionClient = prisma
) => {
  const treeId = source.treeId;
  const tree = await db.tree.clone({ projectId, treeId }, client);
  return { ...source, id: uuid(), treeId: tree.id };
};

const clonePages = async (
  { projectId, source }: { projectId: Project["id"]; source: Pages },
  client: Prisma.TransactionClient = prisma
) => {
  const clones = [];
  for (const page of source.pages) {
    clones.push(await clonePage({ projectId, source: page }, client));
  }
  return Pages.parse({
    homePage: await clonePage({ projectId, source: source.homePage }, client),
    pages: clones,
  });
};

/*
 * We create "dev" build in two cases:
 *   1. when we create a new project
 *   2. when we clone a project
 * We create "prod" build when we publish a dev build.
 */
export async function create(
  projectId: Build["projectId"],
  env: "prod",
  sourceBuild: Build | undefined,
  client: Prisma.TransactionClient
): Promise<void>;
export async function create(
  projectId: Build["projectId"],
  env: "dev",
  sourceBuild: Build | undefined,
  client: Prisma.TransactionClient
): Promise<void>;
// eslint-disable-next-line func-style
export async function create(
  projectId: Build["projectId"],
  env: "dev" | "prod",
  sourceBuild: Build | undefined,
  client: Prisma.TransactionClient
): Promise<void> {
  if (env === "dev") {
    const count = await client.build.count({
      where: { projectId, isDev: true },
    });

    if (count > 0) {
      throw new Error("Dev build already exists");
    }
  }

  if (env === "prod" && sourceBuild === undefined) {
    throw new Error("Source build required for production build");
  }

  if (env === "prod") {
    await client.build.updateMany({
      where: { projectId: projectId, isProd: true },
      data: { isProd: false },
    });
  }

  const build = await client.build.create({
    data: {
      projectId,
      pages: JSON.stringify([]),
      breakpoints: JSON.stringify(
        sourceBuild?.breakpoints ?? db.breakpoints.createValues()
      ),
      styles: serializeStyles(sourceBuild?.styles ?? []),
      styleSources: JSON.stringify(sourceBuild?.styleSources ?? []),
      isDev: env === "dev",
      isProd: env === "prod",
    },
  });

  const pages =
    sourceBuild === undefined
      ? await createPages({ projectId, buildId: build.id }, client)
      : await clonePages({ projectId, source: sourceBuild.pages }, client);

  await client.build.update({
    where: {
      id_projectId: { projectId, id: build.id },
    },
    data: {
      pages: JSON.stringify(pages),
    },
  });
}
