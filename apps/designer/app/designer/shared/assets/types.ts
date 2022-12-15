import { Asset } from "@webstudio-is/asset-uploader";

type PreviewAsset = Pick<
  Asset,
  "path" | "name" | "id" | "format" | "description"
>;

export type UploadedClientAsset = {
  status: "uploaded";
  asset: Asset;
  preview: PreviewAsset | undefined;
};

export type UploadingClientAsset = {
  status: "uploading";
  asset: Asset | undefined;
  preview: PreviewAsset;
};

export type DeletingClientAsset = {
  status: "deleting";
  asset: Asset;
  preview: PreviewAsset | undefined;
};

/**
 * Client side we need more information about the asset than the server provides.
 */
export type ClientAsset =
  | UploadedClientAsset
  | UploadingClientAsset
  | DeletingClientAsset;

export type ActionData = {
  uploadedAssets?: Array<Asset>;
  deletedAssets?: Array<Asset>;
  errors?: string;
};
