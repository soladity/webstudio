import { createReadStream } from "node:fs";
import { join } from "node:path";
import { type LoaderArgs, Response } from "@remix-run/node";
import env from "~/env/env.server";

// this route used as proxy for images to cloudflare endpoint
// https://developers.cloudflare.com/fundamentals/get-started/reference/cdn-cgi-endpoint/

export const loader = async ({ params, request }: LoaderArgs) => {
  const { name } = params;
  if (name === undefined) {
    throw Error("Name is undefined");
  }

  const url = new URL(request.url);
  const width = url.searchParams.get("width");
  const quality = url.searchParams.get("quality");
  const format = url.searchParams.get("format");

  if (width === null || quality === null || format === null) {
    throw Error("Options are invalid");
  }

  const options = `width=${width},quality=${quality},format=${format}`;

  // Allow direct image access, and from the same origin
  const refererRawUrl = request.headers.get("referer");
  const refererUrl = refererRawUrl === null ? url : new URL(refererRawUrl);
  if (refererUrl.origin !== url.origin) {
    throw new Response("Forbidden", {
      status: 403,
    });
  }

  if (env.RESIZE_ORIGIN !== undefined) {
    const assetUrl = `${env.ASSET_BASE_URL}${name}`;
    // @todo add secret ti avoid exploiting our server
    const imageUrl = `${env.RESIZE_ORIGIN}/cdn-cgi/image/${options}/${assetUrl}`;
    const response = await fetch(imageUrl, {
      headers: {
        accept: request.headers.get("accept") ?? "",
        "accept-encoding": request.headers.get("accept-encoding") ?? "",
      },
    });
    response.headers.set("Access-Control-Allow-Origin", url.origin);

    return response;
  }

  if (env.FILE_UPLOAD_PATH === undefined) {
    throw Error("FILE_UPLOAD_PATH is not provided");
  }
  const fileUploadPath = env.FILE_UPLOAD_PATH;
  const filePath = join(process.cwd(), fileUploadPath, name);
  return new Response(createReadStream(filePath));
};
