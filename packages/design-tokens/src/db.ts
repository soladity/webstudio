import {
  type DesignTokens as DbDesignTokens,
  prisma,
  Prisma,
} from "@webstudio-is/prisma-client";
import { applyPatches, Patch } from "immer";
import { DesignToken, DesignTokens } from "./schema";

export const load = async (buildId: DbDesignTokens["buildId"]) => {
  const data = await prisma.designTokens.findUnique({
    where: { buildId },
  });

  if (data === null) {
    return [];
  }

  const designTokens: Array<DesignToken> = JSON.parse(data.value);

  return designTokens.map((token) => DesignToken.parse(token));
};

export const clone = async (
  previousBuildId: DbDesignTokens["buildId"],
  nextBuildId: DbDesignTokens["buildId"],
  client: Prisma.TransactionClient = prisma
) => {
  const data = await client.designTokens.findUnique({
    where: { buildId: previousBuildId },
  });

  if (data === null) {
    return;
  }

  await client.designTokens.create({
    data: {
      buildId: nextBuildId,
      value: data.value,
    },
  });
};

export const patch = async (
  buildId: DbDesignTokens["buildId"],
  patches: Array<Patch>
) => {
  const designTokens = await load(buildId);
  const nextDesignTokens = applyPatches(designTokens, patches);
  const parsedNextDesignTokens = DesignTokens.parse(nextDesignTokens);
  await prisma.designTokens.upsert({
    where: { buildId },
    update: { value: JSON.stringify(parsedNextDesignTokens) },
    create: { buildId, value: JSON.stringify(parsedNextDesignTokens) },
  });
};
