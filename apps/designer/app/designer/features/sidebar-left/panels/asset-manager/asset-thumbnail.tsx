import { useEffect, useState } from "react";
import { Box } from "@webstudio-is/design-system";
import placeholderImage from "~/shared/images/image-placeholder.svg";
import brokenImage from "~/shared/images/broken-image-placeholder.svg";
import { UploadingAnimation } from "./uploading-animation";
import type { Asset } from "@webstudio-is/prisma-client";
import { UploadingAsset } from "../../types";
import { AssetTooltip } from "./asset-tooltip";

const useImageWithFallback = ({
  path = placeholderImage,
}: {
  path?: string;
}) => {
  const [src, setSrc] = useState(placeholderImage);

  useEffect(() => {
    const newImage = new Image();
    newImage.onload = () => setSrc(path);
    newImage.onerror = () => setSrc(brokenImage);
    newImage.src = path;
  }, [path]);

  return src;
};

type ThumbnailProps = {
  path?: string;
  status: Asset["status"];
};

export const Thumbnail = ({ path, status }: ThumbnailProps) => {
  const src = useImageWithFallback({ path });

  return (
    <Box
      css={{
        backgroundImage: `url("${src}")`,
        width: "100%",
        height: "100%",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        position: "absolute",
        left: 0,
        top: 0,
        ...(status === "uploading"
          ? { filter: "blur(1px)", opacity: 0.7 }
          : {}),
      }}
    ></Box>
  );
};

export const AssetThumbnail = (asset: Asset | UploadingAsset) => {
  const { path, alt, status, name } = asset;
  const [isDeleting, setIsDeleting] = useState(false);
  const isUploading = status === "uploading";
  const isUploadedAsset = isUploading === false && "size" in asset;

  const lol = {
    aspectRatio: "1/1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 $2",
    position: "relative",

    "&:hover button": {
      opacity: 1,
    },
  };
  return (
    <Box title={alt || name} css={lol}>
      <Thumbnail path={path} status={status} />
      {isUploadedAsset && (
        <AssetTooltip asset={asset} onDelete={() => setIsDeleting(true)} />
      )}
      {(isUploading || isDeleting) && <UploadingAnimation />}
    </Box>
  );
};
