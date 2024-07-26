import {
  Box as Box,
  Text as Text,
  HtmlEmbed as HtmlEmbed,
} from "@webstudio-is/sdk-components-react";
import {
  Accordion as Accordion,
  AccordionItem as AccordionItem,
  AccordionHeader as AccordionHeader,
  AccordionTrigger as AccordionTrigger,
  AccordionContent as AccordionContent,
} from "../components";

const Component = () => {
  return (
    <Box data-ws-id="root" data-ws-component="Box" className="w-box">
      <Accordion
        data-ws-id="1"
        data-ws-component="Accordion"
        collapsible={true}
        defaultValue={"0"}
        className="w-accordion"
      >
        <AccordionItem
          data-ws-id="4"
          data-ws-component="AccordionItem"
          data-ws-index="0"
          className="w-accordion-item"
        >
          <AccordionHeader
            data-ws-id="6"
            data-ws-component="AccordionHeader"
            className="w-accordion-header"
          >
            <AccordionTrigger
              data-ws-id="8"
              data-ws-component="AccordionTrigger"
              className="w-accordion-trigger"
            >
              <Text data-ws-id="10" data-ws-component="Text" className="w-text">
                {"Is it accessible?"}
              </Text>
              <Box data-ws-id="11" data-ws-component="Box" className="w-box">
                <HtmlEmbed
                  data-ws-id="13"
                  data-ws-component="HtmlEmbed"
                  code={
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" style="display: block;"><path d="M4.04 6.284a.65.65 0 0 1 .92.001L8 9.335l3.04-3.05a.65.65 0 1 1 .921.918l-3.5 3.512a.65.65 0 0 1-.921 0L4.039 7.203a.65.65 0 0 1 .001-.92Z"/></svg>'
                  }
                  className="w-html-embed"
                />
              </Box>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            data-ws-id="15"
            data-ws-component="AccordionContent"
            className="w-accordion-content"
          >
            {"Yes. It adheres to the WAI-ARIA design pattern."}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          data-ws-id="17"
          data-ws-component="AccordionItem"
          data-ws-index="1"
          className="w-accordion-item"
        >
          <AccordionHeader
            data-ws-id="19"
            data-ws-component="AccordionHeader"
            className="w-accordion-header"
          >
            <AccordionTrigger
              data-ws-id="21"
              data-ws-component="AccordionTrigger"
              className="w-accordion-trigger"
            >
              <Text data-ws-id="23" data-ws-component="Text" className="w-text">
                {"Is it styled?"}
              </Text>
              <Box data-ws-id="24" data-ws-component="Box" className="w-box">
                <HtmlEmbed
                  data-ws-id="26"
                  data-ws-component="HtmlEmbed"
                  code={
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" style="display: block;"><path d="M4.04 6.284a.65.65 0 0 1 .92.001L8 9.335l3.04-3.05a.65.65 0 1 1 .921.918l-3.5 3.512a.65.65 0 0 1-.921 0L4.039 7.203a.65.65 0 0 1 .001-.92Z"/></svg>'
                  }
                  className="w-html-embed"
                />
              </Box>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            data-ws-id="28"
            data-ws-component="AccordionContent"
            className="w-accordion-content"
          >
            {
              "Yes. It comes with default styles that matches the other components' aesthetic."
            }
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          data-ws-id="30"
          data-ws-component="AccordionItem"
          data-ws-index="2"
          className="w-accordion-item"
        >
          <AccordionHeader
            data-ws-id="32"
            data-ws-component="AccordionHeader"
            className="w-accordion-header"
          >
            <AccordionTrigger
              data-ws-id="34"
              data-ws-component="AccordionTrigger"
              className="w-accordion-trigger"
            >
              <Text data-ws-id="36" data-ws-component="Text" className="w-text">
                {"Is it animated?"}
              </Text>
              <Box data-ws-id="37" data-ws-component="Box" className="w-box">
                <HtmlEmbed
                  data-ws-id="39"
                  data-ws-component="HtmlEmbed"
                  code={
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" style="display: block;"><path d="M4.04 6.284a.65.65 0 0 1 .92.001L8 9.335l3.04-3.05a.65.65 0 1 1 .921.918l-3.5 3.512a.65.65 0 0 1-.921 0L4.039 7.203a.65.65 0 0 1 .001-.92Z"/></svg>'
                  }
                  className="w-html-embed"
                />
              </Box>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            data-ws-id="41"
            data-ws-component="AccordionContent"
            className="w-accordion-content"
          >
            {
              "Yes. It's animated by default, but you can disable it if you prefer."
            }
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default {
  title: "Components/Accordion",
};

const Story = {
  render() {
    return (
      <>
        <style>
          {`
html {margin: 0; display: grid; min-height: 100%}
@media all {
  :where(body.w-body) {
    font-family: Arial, Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.2;
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0
  }
  :where(div.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(address.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(article.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(aside.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(figure.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(footer.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(header.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(main.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(nav.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(section.w-box) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(div.w-accordion) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(div.w-accordion-item) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(h3.w-accordion-header) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px;
    margin-top: 0px;
    margin-bottom: 0px
  }
  :where(button.w-accordion-trigger) {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    box-sizing: border-box;
    text-transform: none;
    background-color: transparent;
    background-image: none;
    border: 0px solid rgba(226, 232, 240, 1);
    margin: 0;
    padding: 0px
  }
  :where(div.w-text) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px;
    min-height: 1em
  }
  :where(div.w-html-embed) {
    display: contents
  }
  :where(div.w-accordion-content) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
}
@media all {
  [data-ws-id="4"] {
    border-bottom: 1px solid rgba(226, 232, 240, 1)
  }
  [data-ws-id="6"] {
    display: flex
  }
  [data-ws-id="8"] {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    padding-bottom: 1rem;
    font-weight: 500;
    --accordion-trigger-icon-transform: 0deg
  }
  [data-ws-id="8"]:hover {
    text-decoration-line: underline
  }
  [data-ws-id="8"][data-state=open] {
    --accordion-trigger-icon-transform: 180deg
  }
  [data-ws-id="11"] {
    rotate: var(--accordion-trigger-icon-transform);
    height: 1rem;
    width: 1rem;
    flex-grow: 0;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms
  }
  [data-ws-id="15"] {
    overflow-x: hidden;
    overflow-y: hidden;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-bottom: 1rem
  }
  [data-ws-id="17"] {
    border-bottom: 1px solid rgba(226, 232, 240, 1)
  }
  [data-ws-id="19"] {
    display: flex
  }
  [data-ws-id="21"] {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    padding-bottom: 1rem;
    font-weight: 500;
    --accordion-trigger-icon-transform: 0deg
  }
  [data-ws-id="21"]:hover {
    text-decoration-line: underline
  }
  [data-ws-id="21"][data-state=open] {
    --accordion-trigger-icon-transform: 180deg
  }
  [data-ws-id="24"] {
    rotate: var(--accordion-trigger-icon-transform);
    height: 1rem;
    width: 1rem;
    flex-grow: 0;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms
  }
  [data-ws-id="28"] {
    overflow-x: hidden;
    overflow-y: hidden;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-bottom: 1rem
  }
  [data-ws-id="30"] {
    border-bottom: 1px solid rgba(226, 232, 240, 1)
  }
  [data-ws-id="32"] {
    display: flex
  }
  [data-ws-id="34"] {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    padding-bottom: 1rem;
    font-weight: 500;
    --accordion-trigger-icon-transform: 0deg
  }
  [data-ws-id="34"]:hover {
    text-decoration-line: underline
  }
  [data-ws-id="34"][data-state=open] {
    --accordion-trigger-icon-transform: 180deg
  }
  [data-ws-id="37"] {
    rotate: var(--accordion-trigger-icon-transform);
    height: 1rem;
    width: 1rem;
    flex-grow: 0;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms
  }
  [data-ws-id="41"] {
    overflow-x: hidden;
    overflow-y: hidden;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-bottom: 1rem
  }
}
      `}
        </style>
        <Component />
      </>
    );
  },
};

export { Story as Accordion };
