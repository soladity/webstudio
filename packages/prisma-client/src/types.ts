import type { Asset as DbAsset } from "@prisma/client";
export { Location } from "@prisma/client";
export type {
  InstanceProps,
  Project,
  User,
  Breakpoints,
  Build,
} from "@prisma/client";

export type Asset = DbAsset & {
  path: string;
  status?: "uploading" | "uploaded";
};
export type { DbAsset };
