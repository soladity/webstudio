import { z } from "zod";
import {
  type UploadHandlerPart,
  unstable_parseMultipartFormData as unstableCreateFileUploadHandler,
  unstable_composeUploadHandlers as unstableComposeUploadHandlers,
  MaxPartSizeExceededError,
} from "@remix-run/node";
import type { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Location } from "@webstudio-is/prisma-client";
import { toUint8Array } from "../../utils/to-uint8-array";
import { getAssetData, AssetData } from "../../utils/get-asset-data";
import { idsFormDataFieldName } from "../../schema";
import { getUniqueFilename } from "../../utils/get-unique-filename";
import { sanitizeS3Key } from "../../utils/sanitize-s3-key";
import { uuidHandler } from "../../utils/uuid-handler";

const AssetsUploadedSuccess = z.object({
  Location: z.string(),
});

const Ids = z.array(z.string().uuid());

/**
 * Do not change. Upload code assumes its 1.
 */
const MAX_FILES_PER_REQUEST = 1;

export const uploadToS3 = async ({
  client,
  request,
  maxSize,
  bucket,
  acl,
}: {
  client: S3Client;
  request: Request;
  maxSize: number;
  bucket: string;
  acl?: string;
}): Promise<AssetData> => {
  const uploadHandler = createUploadHandler(MAX_FILES_PER_REQUEST, client);

  const formData = await unstableCreateFileUploadHandler(
    request,
    unstableComposeUploadHandlers(
      (file: UploadHandlerPart) =>
        uploadHandler({
          file,
          maxSize,
          bucket,
          acl,
        }),
      uuidHandler
    )
  );

  const imagesFormData = formData.getAll("image") as Array<string>;
  const fontsFormData = formData.getAll("font") as Array<string>;
  const ids = Ids.parse(formData.getAll(idsFormDataFieldName));

  const assetsData = [...imagesFormData, ...fontsFormData]
    .slice(0, MAX_FILES_PER_REQUEST)
    .map((dataString, index) => {
      return AssetData.parse({ ...JSON.parse(dataString), id: ids[index] });
    });

  return assetsData[0];
};

const createUploadHandler = (maxFiles: number, client: S3Client) => {
  let count = 0;

  return async ({
    file,
    maxSize,
    bucket,
    acl,
  }: {
    file: UploadHandlerPart;
    maxSize: number;
    bucket: string;
    acl?: string;
  }): Promise<string | undefined> => {
    if (file.filename === undefined) {
      // Do not parse if it's not a file
      return;
    }

    if (count >= maxFiles) {
      // Do not throw, just ignore the file
      // In case of throw we need to delete previously uploaded files
      return;
    }

    count++;

    if (!file.data) {
      throw new Error("Your asset seems to be empty");
    }

    // @todo this is going to put the entire file in memory
    // this has to be a stream that goes directly to s3
    // Size check has to happen as you stream and interrupted when size is too big
    // Also check if S3 client has an option to check the size limit
    const data = await toUint8Array(file.data);

    if (data.byteLength > maxSize) {
      throw new MaxPartSizeExceededError(file.name, maxSize);
    }

    const fileName = sanitizeS3Key(file.filename);

    const uniqueFilename = getUniqueFilename(fileName);

    // if there is no ACL passed we do not default since some providers do not support it
    const ACL = acl ? { ACL: acl } : {};

    const params: PutObjectCommandInput = {
      ...ACL,
      Bucket: bucket,
      Key: uniqueFilename,
      Body: data,
      ContentType: file.contentType,
      Metadata: {
        // encodeURIComponent is needed to support special characters like Cyrillic
        filename: encodeURIComponent(fileName) || "unnamed",
      },
    };

    const upload = new Upload({ client, params });

    AssetsUploadedSuccess.parse(await upload.done());

    const type = file.contentType.startsWith("image")
      ? ("image" as const)
      : ("font" as const);

    const baseAssetOptions = {
      name: uniqueFilename,
      size: data.byteLength,
      data,
      location: Location.REMOTE,
    };
    let assetOptions;

    if (type === "image") {
      assetOptions = {
        // Id will be set later
        id: "",
        type,
        ...baseAssetOptions,
      };
    } else if (type === "font") {
      assetOptions = {
        // Id will be set later
        id: "",
        type,
        ...baseAssetOptions,
      };
    }

    if (assetOptions === undefined) {
      throw new Error("Asset type not supported");
    }

    const assetData = await getAssetData(assetOptions);

    return JSON.stringify(assetData);
  };
};
