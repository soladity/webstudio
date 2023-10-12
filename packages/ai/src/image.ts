import { traverseTemplate } from "@webstudio-is/jsx-utils";
import type {
  EmbedTemplateInstance,
  EmbedTemplateProp,
  WsEmbedTemplate,
} from "@webstudio-is/react-sdk";

const isRemoteImageGeneratedByAi = (url: string) => {
  // wsai search param is added when image is queried by ai
  // and allows to distinct image urls added by user manually
  try {
    return new URL(url).searchParams.get("wsai") === "true";
  } catch {
    return false;
  }
};

const canAiRegenerateImage = (src: undefined | EmbedTemplateProp) => {
  // asset images should not be regenerated
  if (src && src?.type !== "string") {
    return false;
  }
  // regenerate when image is not specified
  if (src === undefined || src.value.trim() === "") {
    return true;
  }
  return isRemoteImageGeneratedByAi(src.value);
};

type PexelsPhotoResource = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
};

type PexelsSearchResponse = {
  photos: PexelsPhotoResource[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
};

const searchImageInPexels = async ({
  query,
  apiKey,
}: {
  query: string;
  apiKey: string;
}) => {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });
  const result: PexelsSearchResponse = await response.json();
  return result;
};

const queryImageAndMutateInstance = async (
  apiKey: string,
  instance: EmbedTemplateInstance
) => {
  if (instance.props === undefined) {
    return;
  }
  const alt = instance.props.find((prop) => prop.name === "alt");
  if (alt?.type !== "string") {
    return;
  }
  const imageSearchResult = await searchImageInPexels({
    query: alt.value,
    apiKey,
  });
  const [result] = imageSearchResult.photos;
  const url = new URL(result.src.original);
  // mark remote image as generated by ai
  url.searchParams.set("wsai", "true");
  const newSrc: EmbedTemplateProp = {
    name: "src",
    type: "string",
    value: url.href,
  };
  // @todo simplify with props and styles object format
  const srcIndex = instance.props.findIndex((prop) => prop.name === "src");
  if (srcIndex === -1) {
    instance.props.push(newSrc);
  } else {
    instance.props[srcIndex] = newSrc;
  }
  // prevent image deformation when ai specifies image size
  const hasObjectFit = instance.styles?.some(
    (styleDecl) => styleDecl.property === "objectFit"
  );
  if (hasObjectFit === false) {
    instance.styles = instance.styles ?? [];
    instance.styles.push({
      property: "objectFit",
      value: { type: "keyword", value: "cover" },
    });
  }
};

export const queryImagesAndMutateTemplate = async ({
  template,
  apiKey,
}: {
  template: WsEmbedTemplate;
  apiKey: string;
}) => {
  const imageInstances = new Set<EmbedTemplateInstance>();
  traverseTemplate(template, (instance) => {
    if (instance.type === "instance" && instance.component === "Image") {
      if (instance.props === undefined) {
        return;
      }
      const src = instance.props.find((prop) => prop.name === "src");
      const alt = instance.props.find((prop) => prop.name === "alt");
      if (
        canAiRegenerateImage(src) === false ||
        // skip when no alt to generate image from
        alt?.type !== "string"
      ) {
        return;
      }
      imageInstances.add(instance);
    }
  });
  await Promise.allSettled(
    Array.from(imageInstances).map((instance) =>
      queryImageAndMutateInstance(apiKey, instance)
    )
  );
};
