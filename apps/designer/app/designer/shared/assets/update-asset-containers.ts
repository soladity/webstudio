import deepEqual from "fast-deep-equal";
import type { Asset } from "@webstudio-is/asset-uploader";
import { ClientAsset } from "./types";

/**
 * Update local assets (containing optimistic data) with data from the server
 * - We need to preserve the order of local assets.
 * - We need to not remove optimistic assets until we are 100% sure all is fine.
 * - We need to keep in mind that "serverAssets" can be outdated, or contain information we don't have in local (optimistic) assets
 * - updateAssets(assets, data) must be referentially equal to updateAssets(updateAssets(assets, data), data)
 */
export const updateStateAssets = <T>(
  clientAssets: ClientAsset[],
  serverAssets: Asset[]
) => {
  let nextAssets: ClientAsset[] = [...clientAssets];
  // Merging data with existing assets, trying to preserve sorting
  for (const serverAsset of serverAssets) {
    // The same asset is already in the assets
    const sameIndex = nextAssets.findIndex(
      (nextAsset) =>
        (nextAsset.asset?.id ?? nextAsset.preview?.id) === serverAsset.id
    );

    if (sameIndex !== -1) {
      if (nextAssets[sameIndex].status !== "deleting") {
        nextAssets[sameIndex] = {
          status: "uploaded",
          asset: serverAsset,
          // preserve preview to avoid image flickering
          preview: nextAssets[sameIndex].preview,
        };
      }
      continue;
    }

    // Assets array were empty or somebody loaded in parallel
    nextAssets.push({
      status: "uploaded",
      asset: serverAsset,
      preview: undefined,
    });
  }

  // Remove non-preview assets that are not in the data
  nextAssets = nextAssets.filter((nextAsset) => {
    if (nextAsset.status !== "uploading") {
      if (
        serverAssets.find(
          (serverAsset) => serverAsset.id === nextAsset.asset.id
        ) === undefined
      ) {
        return false;
      }
    }

    return true;
  });

  if (deepEqual(nextAssets, clientAssets)) {
    return clientAssets;
  }

  return nextAssets;
};
