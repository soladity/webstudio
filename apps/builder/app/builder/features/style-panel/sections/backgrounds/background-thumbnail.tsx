import { useStore } from "@nanostores/react";
import type { Assets } from "@webstudio-is/asset-uploader";
import { Image as WebstudioImage, loaders } from "@webstudio-is/image";
import { styled, theme } from "@webstudio-is/design-system";
import { assetsStore } from "~/shared/nano-states";
import type { StyleInfo } from "../../shared/style-info";
import brokenImage from "~/shared/images/broken-image-placeholder.svg";
import env from "~/shared/env";
import { layeredBackgroundProps } from "./background-layers";
import { toValue } from "@webstudio-is/css-engine";
import { toPascalCase } from "../../shared/keyword-utils";

const Thumbnail = styled("div", {
  width: theme.spacing[10],
  height: theme.spacing[10],
});

const NoneThumbnail = styled("div", {
  width: theme.spacing[10],
  height: theme.spacing[10],
  background:
    "repeating-conic-gradient(rgba(0,0,0,0.22) 0% 25%, transparent 0% 50%) 0% 33.33% / 40% 40%",
});

const StyledWebstudioImage = styled(WebstudioImage, {
  position: "relative",
  width: theme.spacing[10],
  height: theme.spacing[10],
  objectFit: "contain",

  // This is shown only if an image was not loaded and broken
  // From the spec:
  // - The pseudo-elements generated by ::before and ::after are contained by the element's formatting box,
  //   and thus don't apply to "replaced" elements such as <img>, or to <br> elements
  // Not in spec but supported by all browsers:
  // - broken image is not a "replaced" element so this style is applied
  "&::after": {
    content: "' '",
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${brokenImage})`,
  },
});

const gradientNames = [
  "conic-gradient",
  "linear-gradient",
  "radial-gradient",
  "repeating-conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
];

export const getLayerName = (layerStyle: StyleInfo, assets: Assets) => {
  const backgroundImageStyle = layerStyle.backgroundImage?.value;
  if (
    backgroundImageStyle?.type === "image" &&
    backgroundImageStyle.value.type === "asset"
  ) {
    const asset = assets.get(backgroundImageStyle.value.value);
    if (asset) {
      return asset.name;
    }
  }

  if (backgroundImageStyle?.type === "unparsed") {
    const gradientName = gradientNames.find((name) =>
      backgroundImageStyle.value.includes(name)
    );

    return gradientName ? toPascalCase(gradientName) : "Gradient";
  }

  return "None";
};

export const LayerThumbnail = (props: { layerStyle: StyleInfo }) => {
  const assets = useStore(assetsStore);
  const backgroundImageStyle = props.layerStyle.backgroundImage?.value;

  if (
    backgroundImageStyle?.type === "image" &&
    backgroundImageStyle.value.type === "asset"
  ) {
    const asset = assets.get(backgroundImageStyle.value.value);
    if (asset === undefined) {
      return null;
    }
    const remoteLocation = asset.location === "REMOTE";

    const loader = remoteLocation
      ? loaders.cloudflareImageLoader({
          resizeOrigin: env.RESIZE_ORIGIN,
        })
      : loaders.localImageLoader({
          publicPath: env.ASSET_PUBLIC_PATH,
        });

    return (
      <StyledWebstudioImage
        key={asset.id}
        loader={loader}
        src={asset.path}
        width={theme.spacing[10]}
        optimize={true}
        alt={getLayerName(props.layerStyle, assets)}
      />
    );
  }

  if (backgroundImageStyle?.type === "unparsed") {
    const cssStyle: {
      [property in (typeof layeredBackgroundProps)[number]]?: string;
    } = {};

    for (const property of layeredBackgroundProps) {
      cssStyle[property] = toValue(props.layerStyle[property]?.value);
    }

    return <Thumbnail css={cssStyle} />;
  }

  return <NoneThumbnail />;
};
