/* eslint-disable */
/* This is a auto generated file for building the project */

import { Fragment, useState } from "react";
import type { Asset, ImageAsset, ProjectMeta } from "@webstudio-is/sdk";
import { useResource } from "@webstudio-is/react-sdk";
import {
  Body as Body,
  Form as Form,
} from "@webstudio-is/sdk-components-react-remix";
import {
  Box as Box,
  Label as Label,
  Input as Input,
  Button as Button,
  Heading as Heading,
} from "@webstudio-is/sdk-components-react";

import type { PageData } from "~/routes/_index";
export const fontAssets: Asset[] = [];
export const imageAssets: ImageAsset[] = [
  {
    id: "88d5e2ff-b8f2-4899-aaf8-dde4ade6da10",
    name: "DALL_E_2023-10-30_12.39.46_-_Photo_logo_with_a_bold_cat_silhouette_centered_on_a_contrasting_background_designed_for_clarity_at_small_32x32_favicon_resolution_00h6cEA8u2pJRvVJv7hRe.png",
    description: null,
    projectId: "cddc1d44-af37-4cb6-a430-d300cf6f932d",
    size: 268326,
    type: "image",
    format: "png",
    createdAt: "2023-10-30T13:51:08.416Z",
    meta: { width: 790, height: 786 },
  },
  {
    id: "9a8bc926-7804-4d3f-af81-69196b1d2ed8",
    name: "small-avif-kitty_FnabJsioMWpBtXZSGf4DR.webp",
    description: null,
    projectId: "cddc1d44-af37-4cb6-a430-d300cf6f932d",
    size: 2906,
    type: "image",
    format: "webp",
    createdAt: "2023-09-12T09:44:22.120Z",
    meta: { width: 100, height: 100 },
  },
  {
    id: "cd939c56-bcdd-4e64-bd9c-567a9bccd3da",
    name: "_937084ed-a798-49fe-8664-df93a2af605e_uiBk3o6UWdqolyakMvQJ9.jpeg",
    description: null,
    projectId: "cddc1d44-af37-4cb6-a430-d300cf6f932d",
    size: 210614,
    type: "image",
    format: "jpeg",
    createdAt: "2023-09-06T11:28:43.031Z",
    meta: { width: 1024, height: 1024 },
  },
];
export const pageData: PageData = {
  project: {
    siteName: "KittyGuardedZone",
    faviconAssetId: "88d5e2ff-b8f2-4899-aaf8-dde4ade6da10",
    code: "<script>console.log('KittyGuardedZone')</script>\n",
  },
  page: {
    id: "U1tRJl2ERr8_OFe0g9cN_",
    name: "form",
    title: "form",
    meta: { description: "" },
    rootInstanceId: "a-4nDFkaWy4px1fn38XWJ",
    path: "/form",
  },
};
export const user: { email: string | null } | undefined = {
  email: "hello@webstudio.is",
};
export const projectId = "cddc1d44-af37-4cb6-a430-d300cf6f932d";

type Params = Record<string, string | undefined>;
const Page = (_props: { params: Params }) => {
  let [formState, set$formState] = useState<any>("initial");
  let [formState_1, set$formState_1] = useState<any>("initial");
  return (
    <Body data-ws-id="a-4nDFkaWy4px1fn38XWJ" data-ws-component="Body">
      <Form
        data-ws-id="-1RvizaBcVpHsjvnYxn1c"
        data-ws-component="Form"
        state={formState_1}
        onStateChange={(state: any) => {
          formState_1 = state;
          set$formState_1(formState_1);
        }}
      >
        {(formState_1 === "initial" || formState_1 === "error") && (
          <Box data-ws-id="qhnVrmYGlyrMZi3UzqSQA" data-ws-component="Box">
            <Heading
              data-ws-id="YdHHf4u3jrdbRIWpB_VfH"
              data-ws-component="Heading"
              tag={"h3"}
            >
              {"Default form"}
            </Heading>
            <Label data-ws-id="A0RNI1WVwOGGDbwYnoZia" data-ws-component="Label">
              {"Name"}
            </Label>
            <Input
              data-ws-id="e035xi9fcwYtrn9La49Eh"
              data-ws-component="Input"
              name={"name"}
            />
            <Label data-ws-id="LImtuVzw5R9yQsG4faiGV" data-ws-component="Label">
              {"Email"}
            </Label>
            <Input
              data-ws-id="dcHjdeW_HXPkyQlx3ZiL7"
              data-ws-component="Input"
              name={"email"}
            />
            <Button
              data-ws-id="ZAtG6JgK4sbTnOAZlp2rU"
              data-ws-component="Button"
            >
              {"Submit"}
            </Button>
          </Box>
        )}
        {formState_1 === "success" && (
          <Box data-ws-id="966cjxuqP_T99N27-mqWE" data-ws-component="Box">
            {"Thank you for getting in touch!"}
          </Box>
        )}
        {formState_1 === "error" && (
          <Box data-ws-id="SYG5hhOz31xFJUN_v9zq6" data-ws-component="Box">
            {"Sorry, something went wrong."}
          </Box>
        )}
      </Form>
      <Form
        data-ws-id="isNSM3wXcnHFikwNPlEOL"
        data-ws-component="Form"
        state={formState}
        onStateChange={(state: any) => {
          formState = state;
          set$formState(formState);
        }}
        method={"get"}
        action={"/custom"}
      >
        {(formState === "initial" || formState === "error") && (
          <Box data-ws-id="a5YPRc19IJyhTrjjasA_R" data-ws-component="Box">
            <Heading
              data-ws-id="y4pceTmziuBRIDgUBQNLD"
              data-ws-component="Heading"
              tag={"h3"}
            >
              {"Form with custom action and method"}
            </Heading>
            <Label data-ws-id="_gLjS0enBOV8KW9Ykz_es" data-ws-component="Label">
              {"Name"}
            </Label>
            <Input
              data-ws-id="ydR5B_9uMS4PXFS76TmBh"
              data-ws-component="Input"
              name={"name"}
            />
            <Label data-ws-id="8RU1FyL2QRyqhNUKELGrb" data-ws-component="Label">
              {"Email"}
            </Label>
            <Input
              data-ws-id="TsqGP49hjgEW41ReCwrpZ"
              data-ws-component="Input"
              name={"email"}
            />
            <Button
              data-ws-id="5GWjwVdapuGdn443GIKDW"
              data-ws-component="Button"
            >
              {"Submit"}
            </Button>
          </Box>
        )}
        {formState === "success" && (
          <Box data-ws-id="Gw-ta0R4FNFAGBTVRWKep" data-ws-component="Box">
            {"Thank you for getting in touch!"}
          </Box>
        )}
        {formState === "error" && (
          <Box data-ws-id="ewk_WKpu4syHLPABMmvUz" data-ws-component="Box">
            {"Sorry, something went wrong."}
          </Box>
        )}
      </Form>
    </Body>
  );
};

export { Page };

export const getRemixParams = ({ ...params }: Params): Params => {
  return params;
};

export const pagesPaths = new Set([
  "",
  "/radix",
  "/_route_with_symbols_",
  "/form",
  "/heading-with-id",
  "/resources",
  "/nested/nested-page",
]);

export const formsProperties = new Map<
  string,
  { method?: string; action?: string }
>([["isNSM3wXcnHFikwNPlEOL", { method: "get", action: "/custom" }]]);
