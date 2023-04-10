import * as path from "path";
import { S3Env, FsEnv } from "@webstudio-is/asset-uploader";
import {
  createFsClient,
  createS3Client,
} from "@webstudio-is/asset-uploader/server";

export const createAssetClient = () => {
  if (process.env.NODE_ENV === "development") {
    const env = FsEnv.parse(process.env);
    return createFsClient({
      maxUploadSize: env.MAX_UPLOAD_SIZE,
      fileDirectory: path.join(process.cwd(), env.FILE_UPLOAD_PATH),
    });
  } else {
    const env = S3Env.parse(process.env);
    return createS3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      bucket: env.S3_BUCKET,
      acl: env.S3_ACL,
      maxUploadSize: env.MAX_UPLOAD_SIZE,
    });
  }
};
