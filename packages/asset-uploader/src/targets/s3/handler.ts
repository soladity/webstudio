import { UploadHandler } from "@remix-run/node";
import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import ObjectID from "bson-objectid";

import sharp from "sharp";
import { ImagesUploadedSuccess, s3EnvVariables } from "../../schema";
import {
  getArrayBufferFromIterable,
  getFilenameAndExtension,
} from "../../helpers/array-buffer-helpers";

export const s3UploadHandler: UploadHandler = async ({
  data,
  filename: baseFileName,
  contentType,
}) => {
  const s3Envs = s3EnvVariables.parse(process.env);
  if (!data) return;
  const filename = baseFileName ?? ObjectID().toString();

  const uint8Array = await getArrayBufferFromIterable(data);
  const [name, extension] = getFilenameAndExtension(filename);
  const key = `${name}_${Date.now()}.${extension}`;

  const params: PutObjectCommandInput = {
    Bucket: s3Envs.S3_BUCKET,
    ACL: s3Envs.S3_ACL ?? "public-read",
    Key: key,
    Body: uint8Array,
    ContentType: contentType,
    Metadata: {
      filename,
    },
  };

  const client = new S3Client({
    endpoint: s3Envs.S3_ENDPOINT,
    region: s3Envs.S3_REGION,
    credentials: {
      accessKeyId: s3Envs.S3_ACCESS_KEY_ID,
      secretAccessKey: s3Envs.S3_SECRET_ACCESS_KEY,
    },
  });

  const upload = new Upload({ client, params });

  const newFile = ImagesUploadedSuccess.parse(await upload.done());
  const image = sharp(uint8Array);
  const metadata = await image.metadata();

  // these upload handlers only allow strings to be returned
  return JSON.stringify({
    metadata,
    name: key,
    path: newFile.Location,
  });
};
