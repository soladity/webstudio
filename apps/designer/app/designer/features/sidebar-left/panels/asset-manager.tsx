import { ImageIcon } from "~/shared/icons";
import { Flex, Grid, Heading } from "~/shared/design-system";
import { useEffect, useState } from "react";
import { useActionData } from "@remix-run/react";
import { AssetManagerImage } from "./components/image";

import { AddAnAssetForm } from "./components/add-an-asset-form";
import { Asset } from "../types";

export const useAssetsState = (baseAssets: Array<Asset>) => {
  const imageChanges = useActionData();

  const [assets, setAssets] = useState<Asset[]>(baseAssets);

  useEffect(() => {
    if (imageChanges?.uploadedAssets?.length) {
      setAssets((currentAssets) => [
        ...imageChanges.uploadedAssets,
        ...currentAssets.filter((asset) => asset.status !== "uploading"),
      ]);
    }
    if (imageChanges?.deletedAsset?.id) {
      setAssets((currentAssets) => [
        ...currentAssets.filter(
          (asset) => asset.id !== imageChanges.deletedAsset.id
        ),
      ]);
    }
  }, [imageChanges]);

  const onUploadAsset = (uploadedAssets: Array<Asset>) =>
    setAssets((assets) => [...uploadedAssets, ...assets]);

  return { assets, onUploadAsset };
};

export const TabContent = ({
  assets: baseAssets,
}: {
  assets: Array<Asset>;
}) => {
  const { assets, onUploadAsset } = useAssetsState(baseAssets);
  return (
    <Flex gap="3" direction="column" css={{ padding: "$1" }}>
      <Flex justify="between">
        <Heading>Assets</Heading>
        <AddAnAssetForm onSubmit={onUploadAsset} />
      </Flex>
      <Grid columns={2} gap={2}>
        {assets.map((asset) => (
          <AssetManagerImage key={asset.id} {...asset} />
        ))}
      </Grid>
    </Flex>
  );
};

export const icon = <ImageIcon />;
