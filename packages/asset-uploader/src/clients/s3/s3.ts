import { Sha256 } from "@aws-crypto/sha256-js";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import type { AssetClient } from "../../client";
import { uploadToS3 } from "./upload";

type S3ClientOptions = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  acl?: string;
  maxUploadSize: number;
};

export const createS3Client = (options: S3ClientOptions): AssetClient => {
  const signer = new SignatureV4({
    credentials: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    },
    region: options.region,
    service: "s3",
    sha256: Sha256,
  });

  const uploadFile: AssetClient["uploadFile"] = async (name, type, data) => {
    return uploadToS3({
      signer,
      name,
      type,
      data,
      maxSize: options.maxUploadSize,
      endpoint: options.endpoint,
      bucket: options.bucket,
      acl: options.acl,
    });
  };

  return {
    uploadFile,
  };
};
