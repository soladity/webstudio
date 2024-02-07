import { useStore } from "@nanostores/react";
import {
  Grid,
  InputField,
  Label,
  theme,
  Text,
  TextArea,
  Separator,
  Button,
  css,
} from "@webstudio-is/design-system";
import { ImageControl } from "./image-control";
import { $assets, $pages } from "~/shared/nano-states";
import env from "~/shared/env";
import { Image, createImageLoader } from "@webstudio-is/image";
import { useIds } from "~/shared/form-utils";
import type { ProjectMeta } from "@webstudio-is/sdk";
import { useState } from "react";
import { serverSyncStore } from "~/shared/sync";

const imgStyle = css({
  width: 72,
  height: 72,
  borderRadius: theme.borderRadius[4],
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: theme.colors.borderMain,
});

const defaultMetaSettings: ProjectMeta = {
  siteName: "",
  faviconAssetId: "",
  code: "",
};

export const MetaSection = () => {
  const [meta, setMeta] = useState(
    () => $pages.get()?.meta ?? defaultMetaSettings
  );
  const ids = useIds(["siteName", "favicon", "code"]);
  const assets = useStore($assets);
  const asset = assets.get(meta.faviconAssetId ?? "");
  const favIconUrl = asset ? `${asset.name}` : undefined;

  const imageLoader = createImageLoader({
    imageBaseUrl: env.IMAGE_BASE_URL,
  });

  const handleSave = <Setting extends keyof ProjectMeta>(setting: Setting) => {
    return (value: ProjectMeta[Setting]) => {
      setMeta({
        ...meta,
        [setting]: value,
      });
      serverSyncStore.createTransaction([$pages], (pages) => {
        if (pages === undefined) {
          return;
        }
        if (pages.meta === undefined) {
          pages.meta = {};
        }
        pages.meta[setting] = value;
      });
    };
  };

  return (
    <>
      <Grid
        gap={1}
        css={{
          mx: theme.spacing[5],
          px: theme.spacing[5],
        }}
      >
        <Label htmlFor={ids.siteName}>Site Name</Label>
        <InputField
          id={ids.siteName}
          value={meta.siteName ?? ""}
          onChange={(event) => {
            handleSave("siteName")(event.target.value);
          }}
          placeholder="Current Site Name"
          autoFocus
        />
      </Grid>

      <Separator />

      <Grid gap={2} css={{ mx: theme.spacing[5], px: theme.spacing[5] }}>
        <Text variant="titles">Favicon</Text>
        <Grid flow="column" gap={3}>
          <Image
            width={72}
            height={72}
            className={imgStyle()}
            src={favIconUrl}
            loader={imageLoader}
          />

          <Grid gap={2}>
            <Text color="subtle">
              Upload a 32 x 32 px image to display in browser tabs.
            </Text>
            <ImageControl onAssetIdChange={handleSave("faviconAssetId")}>
              <Button id={ids.favicon} css={{ justifySelf: "start" }}>
                Upload
              </Button>
            </ImageControl>
          </Grid>
        </Grid>
      </Grid>

      <Separator />

      <Grid gap={2} css={{ mx: theme.spacing[5], px: theme.spacing[5] }}>
        <Text variant="titles">Custom Code</Text>
        <Text color="subtle">
          Custom code and scripts will be added at the end of the &lt;head&gt;
          tag to every page across the published project.
        </Text>
        <TextArea
          id={ids.code}
          rows={5}
          autoGrow
          maxRows={10}
          value={meta.code ?? ""}
          onChange={handleSave("code")}
        />
      </Grid>
    </>
  );
};
