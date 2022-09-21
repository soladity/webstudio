import { Asset } from "@webstudio-is/asset-uploader";
import {
  Flex,
  Box,
  Combobox,
  ComboboxListboxItem,
  TextField,
} from "@webstudio-is/design-system";
import { AssetUpload, PreviewAsset, useAssets } from "~/designer/shared/assets";

const getItems = (assets: Array<Asset | PreviewAsset>) =>
  assets.map((asset) => ({
    label:
      "meta" in asset && "family" in asset.meta
        ? asset.meta.family
        : asset.name,
  }));

type FontsManagerProps = {
  value: string;
};

export const FontsManager = ({ value }: FontsManagerProps) => {
  const { assets, onSubmitAssets, onActionData } = useAssets("font");
  const items = getItems(assets);

  return (
    <Flex
      gap="3"
      direction="column"
      css={{ padding: "$1", paddingTop: "$2", height: 460, overflow: "hidden" }}
    >
      <Box css={{ padding: "$2" }}>
        <AssetUpload
          onSubmit={onSubmitAssets}
          onActionData={onActionData}
          type="font"
        />
      </Box>

      <Combobox
        open
        name="prop"
        items={items}
        selectedItem={{ label: value }}
        //itemToString={(item) => item ?? ""}
        onItemSelect={(value) => {
          console.log("onItemSelect", value);
          //onChange(id, "prop", value);
        }}
        renderTextField={({ inputProps: { value, ...inputProps } }) => (
          <TextField {...inputProps} placeholder="Search" />
        )}
        renderPopperContent={(props) => <>{props.children}</>}
        renderItem={(props) => <ComboboxListboxItem {...props} />}
      />
    </Flex>
  );
};
