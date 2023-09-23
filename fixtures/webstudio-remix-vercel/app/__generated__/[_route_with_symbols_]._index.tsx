/* eslint-disable */
/* This is a auto generated file for building the project */

import { type ReactNode, useState } from "react";
import type { PageData } from "~/routes/_index";
import type { Asset } from "@webstudio-is/sdk";
import {
  Body as Body,
  Image as Image,
} from "@webstudio-is/sdk-components-react";

export const fontAssets: Asset[] = [];
export const pageData: PageData = {
  build: {
    props: [
      [
        "HNaXZUvlg14jFvxc29n9T",
        {
          id: "HNaXZUvlg14jFvxc29n9T",
          name: "src",
          instanceId: "AdXSAYCx4QDo5QN6nLoGs",
          type: "string",
          value: "/assets/small-avif-kitty_FnabJsioMWpBtXZSGf4DR.webp",
        },
      ],
    ],
  },
  pages: [
    {
      id: "7Db64ZXgYiRqKSQNR-qTQ",
      name: "Home",
      title: "Home",
      meta: {},
      rootInstanceId: "On9cvWCxr5rdZtY9O1Bv0",
      path: "",
    },
    {
      id: "xfvB4UThQXmQ_OubPYrkg",
      name: "radix",
      title: "radix",
      meta: { description: "" },
      rootInstanceId: "uKWGyE9JY3cPwY-xI9vk6",
      path: "/radix",
    },
    {
      id: "szYLvBduHPmbtqQKCDY0b",
      name: "RouteWithSymbols",
      title: "RouteWithSymbols",
      meta: { description: "" },
      rootInstanceId: "EDEfpMPRqDejthtwkH7ws",
      path: "/_route_with_symbols_",
    },
    {
      id: "U1tRJl2ERr8_OFe0g9cN_",
      name: "form",
      title: "form",
      meta: { description: "" },
      rootInstanceId: "a-4nDFkaWy4px1fn38XWJ",
      path: "/form",
    },
    {
      id: "-J9I4Oo6mONfQlf_3-OqG",
      name: "heading-with-id",
      title: "heading-with-id",
      meta: { description: "" },
      rootInstanceId: "O-ljaGZQ0iRNTlEshMkgE",
      path: "/heading-with-id",
    },
  ],
  page: {
    id: "szYLvBduHPmbtqQKCDY0b",
    name: "RouteWithSymbols",
    title: "RouteWithSymbols",
    meta: { description: "" },
    rootInstanceId: "EDEfpMPRqDejthtwkH7ws",
    path: "/_route_with_symbols_",
  },
  assets: [
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
  ],
};
export const user: { email: string | null } | undefined = {
  email: "hello@webstudio.is",
};
export const projectId = "cddc1d44-af37-4cb6-a430-d300cf6f932d";

const Page = (props: { scripts?: ReactNode }) => {
  return (
    <Body data-ws-id="EDEfpMPRqDejthtwkH7ws" data-ws-component="Body">
      <Image
        data-ws-id="AdXSAYCx4QDo5QN6nLoGs"
        data-ws-component="Image"
        src={"/assets/small-avif-kitty_FnabJsioMWpBtXZSGf4DR.webp"}
      />
      {props.scripts}
    </Body>
  );
};

export { Page };

export const formsProperties = new Map<
  string,
  { method?: string; action?: string }
>([]);
