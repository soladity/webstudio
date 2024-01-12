import type { Page, Prop, Assets } from "@webstudio-is/sdk";

export type Pages = Map<Page["id"], Page>;

export const normalizeProps = ({
  props,
  assetBaseUrl,
  assets,
  pages,
}: {
  props: Prop[];
  assetBaseUrl: string;
  assets: Assets;
  pages: Pages;
}) => {
  const newProps: Prop[] = [];
  for (const prop of props) {
    if (prop.type === "asset") {
      const assetId = prop.value;
      const asset = assets.get(assetId);
      if (asset === undefined) {
        continue;
      }
      newProps.push({
        id: prop.id,
        name: prop.name,
        required: prop.required,
        instanceId: prop.instanceId,
        type: "string",
        value: `${assetBaseUrl}${asset.name}`,
      });
      continue;
    }

    if (prop.type === "page") {
      let page: undefined | Page;
      let idProp: undefined | Prop;
      if (typeof prop.value === "string") {
        const pageId = prop.value;
        page = pages.get(pageId);
      } else {
        const { pageId, instanceId } = prop.value;
        page = pages.get(pageId);
        idProp = props.find(
          (prop) => prop.instanceId === instanceId && prop.name === "id"
        );
      }
      if (page === undefined) {
        continue;
      }
      const url = new URL(page.path, "https://any-valid.url");
      let value = url.pathname;
      if (idProp?.type === "string") {
        const hash = idProp.value;
        url.hash = encodeURIComponent(hash);
        value = `${url.pathname}${url.hash}`;
      }
      newProps.push({
        id: prop.id,
        name: prop.name,
        required: prop.required,
        instanceId: prop.instanceId,
        type: "string",
        value,
      });
      continue;
    }

    newProps.push(prop);
  }
  return newProps;
};

export const idAttribute = "data-ws-id" as const;
export const selectorIdAttribute = "data-ws-selector" as const;
export const componentAttribute = "data-ws-component" as const;
export const showAttribute = "data-ws-show" as const;
export const indexAttribute = "data-ws-index" as const;
export const collapsedAttribute = "data-ws-collapsed" as const;
export const textContentAttribute = "data-ws-text-content" as const;

export const getInstanceIdFromComponentProps = (
  props: Record<string, unknown>
) => {
  return props[idAttribute] as string;
};

export const getIndexWithinAncestorFromComponentProps = (
  props: Record<string, unknown>
) => {
  return props[indexAttribute] as string | undefined;
};
