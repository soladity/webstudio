import warnOnce from "warn-once";
import { type Patch, applyPatches } from "immer";
import { type Project, prisma } from "@webstudio-is/prisma-client";
import type { Asset } from "@webstudio-is/asset-uploader";
import { formatAsset } from "@webstudio-is/asset-uploader/server";
import {
  type Build,
  type StoredStyleDecl,
  type StyleDecl,
  getStyleDeclKey,
  StoredStyles,
  Styles,
} from "@webstudio-is/project-build";
import {
  authorizeProject,
  type AppContext,
} from "@webstudio-is/trpc-interface/server";

const parseValue = (
  styleValue: StoredStyleDecl["value"],
  assetsMap: Map<string, Asset>
) => {
  if (styleValue.type === "image") {
    return {
      type: "image" as const,
      value: styleValue.value.flatMap((item) => {
        const asset = assetsMap.get(item.value);
        if (asset === undefined) {
          warnOnce(true, `Asset with assetId "${item.value}" not found`);
          return [];
        }
        if (asset.type === "image") {
          return [
            {
              type: "asset" as const,
              value: asset,
            },
          ];
        }
        return [];
      }),
    };
  }
  return styleValue;
};

export const parseStyles = async (
  projectId: Asset["projectId"],
  stylesString: string
) => {
  const storedStyles = StoredStyles.parse(JSON.parse(stylesString));

  const assetIds: string[] = [];
  for (const { value: styleValue } of storedStyles) {
    if (styleValue.type === "image") {
      for (const item of styleValue.value) {
        if (item.type === "asset") {
          assetIds.push(item.value);
        }
      }
    }
  }

  // Load all assets
  const assets = await prisma.asset.findMany({
    where: {
      id: { in: assetIds },
      projectId,
    },
  });
  const assetsMap = new Map<string, Asset>();
  for (const asset of assets) {
    assetsMap.set(asset.id, formatAsset(asset));
  }

  const styles: Styles = new Map();
  for (const storedStyleDecl of storedStyles) {
    const styleDecl = {
      styleSourceId: storedStyleDecl.styleSourceId,
      breakpointId: storedStyleDecl.breakpointId,
      property: storedStyleDecl.property,
      value: parseValue(storedStyleDecl.value, assetsMap),
    };
    styles.set(getStyleDeclKey(styleDecl), styleDecl);
  }

  return styles;
};

/**
 * prepare value to store in db
 */
const serializeValue = (styleValue: StyleDecl["value"]) => {
  if (styleValue.type === "image") {
    return {
      type: "image" as const,
      value: styleValue.value.map((asset) => ({
        type: asset.type,
        // only asset id is stored in db
        value: asset.value.id,
      })),
    };
  }
  return styleValue;
};

export const serializeStyles = (styles: Styles) => {
  const storedStyles: StoredStyles = Array.from(
    styles.values(),
    (styleDecl) => {
      return {
        breakpointId: styleDecl.breakpointId,
        styleSourceId: styleDecl.styleSourceId,
        property: styleDecl.property,
        value: serializeValue(styleDecl.value),
      };
    }
  );
  return JSON.stringify(storedStyles);
};

export const patch = async (
  { buildId, projectId }: { buildId: Build["id"]; projectId: Project["id"] },
  patches: Array<Patch>,
  context: AppContext
) => {
  const canEdit = await authorizeProject.hasProjectPermit(
    { projectId, permit: "edit" },
    context
  );

  if (canEdit === false) {
    throw new Error("You don't have edit access to this project");
  }

  const build = await prisma.build.findUnique({
    where: {
      id_projectId: { projectId, id: buildId },
    },
  });
  if (build === null) {
    return;
  }

  // these styles are filtered by treeId
  const styles = await parseStyles(build.projectId, build.styles);

  const patchedStyles = Styles.parse(applyPatches(styles, patches));

  await prisma.build.update({
    data: {
      styles: serializeStyles(patchedStyles),
    },
    where: {
      id_projectId: { projectId, id: buildId },
    },
  });
};
