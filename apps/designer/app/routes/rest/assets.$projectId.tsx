import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { Asset } from "@webstudio-is/asset-uploader";
import {
  deleteAssets,
  uploadAssets,
  loadByProject,
} from "@webstudio-is/asset-uploader/server";
import { toast } from "@webstudio-is/design-system";
import { useEffect } from "react";
import { zfd } from "zod-form-data";
import type { ActionData } from "~/designer/shared/assets";
import { sentryException } from "~/shared/sentry";

const DeleteAssets = zfd.formData({
  assetId: zfd.repeatableOfType(zfd.text()),
});

export const loader = async ({ params }: LoaderArgs): Promise<Array<Asset>> => {
  if (params.projectId === undefined) {
    throw new Error("Project id undefined");
  }
  return await loadByProject(params.projectId);
};

export const action = async (
  props: ActionArgs
): Promise<ActionData | Array<Asset> | undefined> => {
  const { request, params } = props;

  if (params.projectId === undefined) {
    throw new Error("Project id undefined");
  }
  try {
    /**
     * To prevent the AssetsProvider from being redrawn every time an action is requested, we use PUT instead of GET
     * to load assets. The only reason PUT is chosen is that it is idempotent and has not been used before.
     */
    if (request.method === "PUT") {
      return await loader(props);
    }

    if (request.method === "DELETE") {
      const { assetId: ids } = DeleteAssets.parse(await request.formData());
      const deletedAssets = await deleteAssets(ids);
      return { deletedAssets };
    }

    if (request.method === "POST") {
      const assets = await uploadAssets({
        request,
        projectId: params.projectId,
      });
      return {
        uploadedAssets: assets.map((asset) => ({
          ...asset,
          status: "uploaded",
        })),
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

export const useAction = () => {
  const actionData: ActionData | undefined = useActionData();

  useEffect(() => {
    if (actionData?.errors) {
      toast.error(actionData.errors);
    }
  }, [actionData]);
};
