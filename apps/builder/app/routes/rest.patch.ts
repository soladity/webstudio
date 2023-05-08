import type { ActionArgs } from "@remix-run/node";
import type { SyncItem } from "immerhin";
import { prisma } from "@webstudio-is/prisma-client";
import {
  type Build,
  Breakpoints,
  Instances,
  Pages,
  Props,
  StyleSourceSelections,
  StyleSources,
  Styles,
} from "@webstudio-is/project-build";
import {
  parsePages,
  parseInstances,
  parseStyleSourceSelections,
  parseStyleSources,
  parseStyles,
  parseProps,
  parseBreakpoints,
  serializePages,
  serializeBreakpoints,
  serializeInstances,
  serializeProps,
  serializeStyleSources,
  serializeStyleSourceSelections,
  serializeStyles,
} from "@webstudio-is/project-build/index.server";
import { patchAssets } from "@webstudio-is/asset-uploader/index.server";
import type { Project } from "@webstudio-is/project";
import { createContext } from "~/shared/context.server";
import { createAssetClient } from "~/shared/asset-client";
import { authorizeProject } from "@webstudio-is/trpc-interface/index.server";
import { applyPatches } from "immer";

type PatchData = {
  transactions: Array<SyncItem>;
  buildId: Build["id"];
  projectId: Project["id"];
};

export const action = async ({ request }: ActionArgs) => {
  const { buildId, projectId, transactions }: PatchData = await request.json();
  if (buildId === undefined) {
    return { errors: "Build id required" };
  }
  if (projectId === undefined) {
    return { errors: "Project id required" };
  }

  const context = await createContext(request);
  const canEdit = await authorizeProject.hasProjectPermit(
    { projectId, permit: "edit" },
    context
  );
  if (canEdit === false) {
    throw Error("You don't have edit access to this project");
  }

  const build = await prisma.build.findUnique({
    where: { id_projectId: { projectId, id: buildId } },
  });
  if (build === null) {
    throw Error(`Build ${buildId} not found`);
  }

  const buildData: {
    pages?: Pages;
    breakpoints?: Breakpoints;
    instances?: Instances;
    props?: Props;
    styleSources?: StyleSources;
    styleSourceSelections?: StyleSourceSelections;
    styles?: Styles;
  } = {};

  const skipValidation = true;

  for await (const transaction of transactions) {
    for await (const change of transaction.changes) {
      const { namespace, patches } = change;
      if (patches.length === 0) {
        continue;
      }

      if (namespace === "pages") {
        // lazily parse build data before patching
        const pages =
          buildData.pages ?? parsePages(build.pages, skipValidation);
        buildData.pages = applyPatches(pages, patches);
        continue;
      }

      if (namespace === "instances") {
        const instances =
          buildData.instances ??
          parseInstances(build.instances, skipValidation);
        buildData.instances = applyPatches(instances, patches);
        continue;
      }

      if (namespace === "styleSourceSelections") {
        const styleSourceSelections =
          buildData.styleSourceSelections ??
          parseStyleSourceSelections(
            build.styleSourceSelections,
            skipValidation
          );
        buildData.styleSourceSelections = applyPatches(
          styleSourceSelections,
          patches
        );
        continue;
      }

      if (namespace === "styleSources") {
        const styleSources =
          buildData.styleSources ??
          parseStyleSources(build.styleSources, skipValidation);
        buildData.styleSources = applyPatches(styleSources, patches);
        continue;
      }

      if (namespace === "styles") {
        const styles =
          buildData.styles ?? parseStyles(build.styles, skipValidation);
        buildData.styles = applyPatches(styles, patches);
        continue;
      }

      if (namespace === "props") {
        const props =
          buildData.props ?? parseProps(build.props, skipValidation);
        buildData.props = applyPatches(props, patches);
        continue;
      }

      if (namespace === "breakpoints") {
        const breakpoints =
          buildData.breakpoints ??
          parseBreakpoints(build.breakpoints, skipValidation);
        buildData.breakpoints = applyPatches(breakpoints, patches);
        continue;
      }

      if (namespace === "assets") {
        // assets implements own patching
        // @todo parallelize the updates
        // currently not possible because we fetch the entire tree
        // and parallelized updates will cause unpredictable side effects
        await patchAssets({ projectId }, patches, context, createAssetClient());
        continue;
      }

      return { errors: `Unknown namespace "${namespace}"` };
    }
  }

  // save build data when all patches applied
  const dbBuildData: Parameters<typeof prisma.build.update>[0]["data"] = {};
  if (buildData.pages) {
    // parse with zod before serialization to avoid saving invalid data
    dbBuildData.pages = serializePages(Pages.parse(buildData.pages));
  }
  if (buildData.breakpoints) {
    dbBuildData.breakpoints = serializeBreakpoints(
      Breakpoints.parse(buildData.breakpoints)
    );
  }
  if (buildData.instances) {
    dbBuildData.instances = serializeInstances(
      Instances.parse(buildData.instances)
    );
  }
  if (buildData.props) {
    dbBuildData.props = serializeProps(Props.parse(buildData.props));
  }
  if (buildData.styleSources) {
    dbBuildData.styleSources = serializeStyleSources(
      StyleSources.parse(buildData.styleSources)
    );
  }
  if (buildData.styleSourceSelections) {
    dbBuildData.styleSourceSelections = serializeStyleSourceSelections(
      StyleSourceSelections.parse(buildData.styleSourceSelections)
    );
  }
  if (buildData.styles) {
    dbBuildData.styles = serializeStyles(Styles.parse(buildData.styles));
  }
  // check any build data is changed because only assets could change
  if (Object.keys(dbBuildData).length > 0) {
    await prisma.build.update({
      data: dbBuildData,
      where: {
        id_projectId: { projectId, id: buildId },
      },
    });
  }

  return { status: "ok" };
};
