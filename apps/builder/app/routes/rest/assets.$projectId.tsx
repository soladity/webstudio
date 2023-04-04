import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { Asset } from "@webstudio-is/asset-uploader";
import {
  uploadAssets,
  loadByProject,
} from "@webstudio-is/asset-uploader/server";
import { toast } from "@webstudio-is/design-system";
import { useEffect } from "react";
import type { ActionData } from "~/builder/shared/assets";
import { sentryException } from "~/shared/sentry";
import { createContext } from "~/shared/context.server";

export const loader = async ({
  params,
  request,
}: LoaderArgs): Promise<Array<Asset>> => {
  if (params.projectId === undefined) {
    throw new Error("Project id undefined");
  }
  const context = await createContext(request);
  return await loadByProject(params.projectId, context);
};

export const action = async (
  props: ActionArgs
): Promise<ActionData | Array<Asset> | undefined> => {
  const { request, params } = props;

  if (params.projectId === undefined) {
    throw new Error("Project id undefined");
  }

  const context = await createContext(request);

  try {
    if (request.method === "POST") {
      const assets = await uploadAssets(
        {
          request,
          projectId: params.projectId,
        },
        context
      );
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
