import { Asset as DbAsset, Location } from "@webstudio-is/prisma-client";
import { FsEnv, S3Env } from "../schema";
import path from "path";

const s3Envs = S3Env.safeParse(process.env);
const fsEnv = FsEnv.parse(process.env);

export const getAssetPath = (asset: DbAsset) => {
  if (asset.location === Location.FS) {
    const splitPath = fsEnv.FILE_UPLOAD_PATH.split("public");
    const locUrl = new URL(
      path.join(
        "/",
        splitPath[splitPath.length - 1],
        encodeURIComponent(asset.name)
      ),
      // Hostname here is not important
      "http://localhost"
    );

    return locUrl.pathname;
  }

  if (asset.location === Location.REMOTE && s3Envs.success) {
    if (s3Envs.data.ASSET_CDN_URL) {
      const cndUrl = new URL(s3Envs.data.ASSET_CDN_URL);
      // We encode file name during upload,
      // see /packages/asset-uploader/src/targets/s3/upload.ts "Key: encodeURIComponent(uniqueFilename)"
      // here we need to encode file name, i.e cndUrl.pathname = encodeURIComponent(fileName)
      // but having that fileName = encodeURIComponent(asset.name) we are doing double encoding
      cndUrl.pathname = asset.name;
      return cndUrl.toString();
    }
    const s3Url = new URL(s3Envs.data.S3_ENDPOINT);
    s3Url.hostname = `${s3Envs.data.S3_BUCKET}.${s3Url.hostname}`;
    // See above comment about double encoding
    s3Url.pathname = asset.name;
    return s3Url.toString();
  }

  return "";
};
