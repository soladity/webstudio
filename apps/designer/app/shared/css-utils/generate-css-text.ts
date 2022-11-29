import { json } from "@remix-run/node";
import { db } from "@webstudio-is/project/server";
import { addGlobalRules, utils } from "@webstudio-is/project";
import { loadCanvasData } from "~/shared/db";
import { createCssEngine } from "@webstudio-is/css-engine";
import { idAttribute } from "@webstudio-is/react-sdk";
import type { BuildParams } from "../router-utils";

export const generateCssText = async (buildParams: BuildParams) => {
  const project = await db.project.loadByParams(buildParams);

  if (project === null) {
    throw json("Project not found", { status: 404 });
  }

  const canvasData = await loadCanvasData(
    project,
    buildParams.mode === "published" ? "prod" : "dev",
    "pageId" in buildParams ? buildParams.pageId : buildParams.pagePath
  );

  if (canvasData === undefined) {
    throw json("Page not found", { status: 404 });
  }

  const engine = createCssEngine();

  addGlobalRules(engine, canvasData);

  for (const breakpoint of canvasData.breakpoints) {
    engine.addMediaRule(breakpoint.id, breakpoint);
  }

  const cssRules = utils.tree.getCssRules(canvasData.tree?.root);
  for (const [instanceId, cssRule] of cssRules) {
    engine.addStyleRule(`[${idAttribute}="${instanceId}"]`, cssRule);
  }
  const { cssText } = engine;
  return cssText;
};
