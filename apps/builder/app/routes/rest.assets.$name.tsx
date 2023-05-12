import type { ActionArgs } from "@remix-run/node";
import type { Asset } from "@webstudio-is/asset-uploader";
import { uploadFile } from "@webstudio-is/asset-uploader/index.server";
import type { ActionData } from "~/builder/shared/assets";
import { sentryException } from "~/shared/sentry";
import { createAssetClient } from "~/shared/asset-client";

export const action = async (
  props: ActionArgs
): Promise<ActionData | Array<Asset> | undefined> => {
  const { request, params } = props;

  if (params.name === undefined) {
    throw new Error("Name is undefined");
  }

  try {
    if (request.method === "POST" && request.body !== null) {
      const asset = await uploadFile(
        params.name,
        request.body,
        createAssetClient()
      );
      return {
        uploadedAssets: [asset],
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      sentryException({ error });
      return {
        errors: error.message,
      };
    }
  }
};
