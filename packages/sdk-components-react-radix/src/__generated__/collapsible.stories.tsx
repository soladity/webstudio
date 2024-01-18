import { useState } from "react";
import {
  Box as Box,
  Button as Button,
  Text as Text,
} from "@webstudio-is/sdk-components-react";
import {
  Collapsible as Collapsible,
  CollapsibleTrigger as CollapsibleTrigger,
  CollapsibleContent as CollapsibleContent,
} from "../components";

type Params = Record<string, string | undefined>;
const Page = (_props: { params: Params }) => {
  let [collapsibleOpen, set$collapsibleOpen] = useState<any>(false);
  let onOpenChange = (open: any) => {
    collapsibleOpen = open;
    set$collapsibleOpen(collapsibleOpen);
  };
  return (
    <Box data-ws-id="root" data-ws-component="Box">
      <Collapsible
        data-ws-id="1"
        data-ws-component="Collapsible"
        open={collapsibleOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger
          data-ws-id="5"
          data-ws-component="CollapsibleTrigger"
        >
          <Button
            data-ws-id="6"
            data-ws-component="Button"
            className="c17al2u0 c1ufcra4 c17gos5d cn4f13s c1wic2il cdem58j c102tttv cb204z1 ck2qarh c1nxbatd caktpzb c1bm526f c110hgy6 c1oai8p0 clo3r8o cw9oyzl cuqxbts cg19ih8 c1479lj6 comq4ym c1qx3pju cut8gip c1qjvju3 c18kkil c1c2uk29 c1x1m3cj cey1d5i cbnv1sn co0lfwl c1kn3u98 c2odgnt chlvjga c1jx7vpr c1jirpm3 ce92j53 c1dr421o c14ytp9r"
          >
            {"Click to toggle content"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          data-ws-id="8"
          data-ws-component="CollapsibleContent"
        >
          <Text data-ws-id="9" data-ws-component="Text">
            {"Collapsible Content"}
          </Text>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  );
};

export default {
  title: "Components/Collapsible",
};

const Story = {
  render() {
    return (
      <>
        <style>
          {`
html {margin: 0; display: grid; min-height: 100%}
@media all {
  body:where([data-ws-component="Body"]) {
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
    margin-left: 0;
    font-family: Arial, Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.2;
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale
  }
  div:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  address:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  article:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  aside:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  figure:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  footer:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  header:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  main:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  nav:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  section:where([data-ws-component="Box"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  div:where([data-ws-component="Collapsible"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  button:where([data-ws-component="Button"]) {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
    margin-left: 0;
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    text-transform: none
  }
  div:where([data-ws-component="CollapsibleContent"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  div:where([data-ws-component="Text"]) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px;
    min-height: 1em
  }
}@media all {
  .c17al2u0 {
    border-top-style: solid
  }
  .c1ufcra4 {
    border-right-style: solid
  }
  .c17gos5d {
    border-bottom-style: solid
  }
  .cn4f13s {
    border-left-style: solid
  }
  .c1wic2il {
    border-top-color: rgba(226, 232, 240, 1)
  }
  .cdem58j {
    border-right-color: rgba(226, 232, 240, 1)
  }
  .c102tttv {
    border-bottom-color: rgba(226, 232, 240, 1)
  }
  .cb204z1 {
    border-left-color: rgba(226, 232, 240, 1)
  }
  .ck2qarh {
    border-top-width: 1px
  }
  .c1nxbatd {
    border-right-width: 1px
  }
  .caktpzb {
    border-bottom-width: 1px
  }
  .c1bm526f {
    border-left-width: 1px
  }
  .c110hgy6 {
    background-color: rgba(255, 255, 255, 0.8)
  }
  .c1oai8p0 {
    display: inline-flex
  }
  .clo3r8o {
    align-items: center
  }
  .cw9oyzl {
    justify-content: center
  }
  .cuqxbts {
    border-top-left-radius: 0.375rem
  }
  .cg19ih8 {
    border-top-right-radius: 0.375rem
  }
  .c1479lj6 {
    border-bottom-right-radius: 0.375rem
  }
  .comq4ym {
    border-bottom-left-radius: 0.375rem
  }
  .c1qx3pju {
    font-size: 0.875rem
  }
  .cut8gip {
    line-height: 1.25rem
  }
  .c1qjvju3 {
    font-weight: 500
  }
  .c18kkil {
    height: 2.5rem
  }
  .c1c2uk29 {
    padding-left: 1rem
  }
  .c1x1m3cj {
    padding-right: 1rem
  }
  .cey1d5i {
    padding-top: 0.5rem
  }
  .cbnv1sn {
    padding-bottom: 0.5rem
  }
  .co0lfwl:focus-visible {
    outline-width: 2px
  }
  .c1kn3u98:focus-visible {
    outline-style: solid
  }
  .c2odgnt:focus-visible {
    outline-color: transparent
  }
  .chlvjga:focus-visible {
    outline-offset: 2px
  }
  .c1jx7vpr:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(148, 163, 184, 1)
  }
  .c1jirpm3:disabled {
    pointer-events: none
  }
  .ce92j53:disabled {
    opacity: 0.5
  }
  .c1dr421o:hover {
    background-color: rgba(241, 245, 249, 0.9)
  }
  .c14ytp9r:hover {
    color: rgba(15, 23, 42, 1)
  }
}
      `}
        </style>
        <Page params={{}} />
      </>
    );
  },
};

export { Story as Collapsible };
