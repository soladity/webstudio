import { useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type { Project, Asset } from "@webstudio-is/react-sdk";
import { Designer, links } from "~/designer";
import * as db from "~/shared/db";
import config from "~/config";
import env from "~/env.server";
import { z } from "zod";
import ObjectID from "bson-objectid";
export { links };

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id === undefined) throw new Error("Project id undefined");
  const project = await db.project.loadById(params.id);
  const assets = await db.assets.loadByProject(params.id);
  if (project === null) {
    return { errors: `Project "${params.id}" not found` };
  }
  return { config, assets, project, env };
};

const directory = "./public/uploads";

type Data = {
  config: typeof config;
  project: Project;
  assets: Asset[];
};

type Error = {
  errors: "string";
};

const ImageUpload = z.object({
  name: z.string(),
  type: z.string(),
});
type ImageUpload = z.infer<typeof ImageUpload>;

export const action: ActionFunction = async ({ request, params }) => {
  if (params.id === undefined) throw new Error("Project id undefined");
  try {
    const randomId = ObjectID.toString();
    const formData = await unstable_parseMultipartFormData(
      request,
      unstable_createFileUploadHandler({
        maxPartSize: 10_000_000,
        directory,
        file: ({ filename }) => `${randomId}_${filename}`,
      })
    );

    const imageInfo = ImageUpload.parse(formData.get("image"));

    const info = imageInfo as ImageUpload;
    const fileName = `${randomId}_${info.name}`;
    const data = {
      type: info.type,
      name: fileName,
      path: `/uploads/${fileName}`,
    };
    db.assets.create(params.id, data);

    return {
      ok: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: error.message,
      };
    }
  }
};

const DesignerRoute = () => {
  const data = useLoaderData<Data | Error>();
  if ("errors" in data) {
    return <p>{data.errors}</p>;
  }
  return <Designer {...data} />;
};

export default DesignerRoute;
