import {
  Box as Box,
  Button as Button,
  HtmlEmbed as HtmlEmbed,
  Text as Text,
} from "@webstudio-is/sdk-components-react";
import {
  Dialog as Dialog,
  DialogTrigger as DialogTrigger,
  DialogOverlay as DialogOverlay,
  DialogContent as DialogContent,
  DialogTitle as DialogTitle,
  DialogDescription as DialogDescription,
  DialogClose as DialogClose,
} from "../components";

const Component = () => {
  return (
    <Box data-ws-id="root" data-ws-component="Box" className="w-box">
      <Dialog data-ws-id="1" data-ws-component="Dialog">
        <DialogTrigger data-ws-id="2" data-ws-component="DialogTrigger">
          <Button
            data-ws-id="3"
            data-ws-component="Button"
            className="w-button"
          >
            <HtmlEmbed
              data-ws-id="5"
              data-ws-component="HtmlEmbed"
              code={
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="currentColor" width="100%" height="100%" style="display: block;"><path fill-rule="evenodd" d="M2 5.998a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 5.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 5.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/></svg>'
              }
              className="w-html-embed"
            />
          </Button>
        </DialogTrigger>
        <DialogOverlay
          data-ws-id="7"
          data-ws-component="DialogOverlay"
          className="w-dialog-overlay"
        >
          <DialogContent
            data-ws-id="9"
            data-ws-component="DialogContent"
            className="w-dialog-content"
          >
            <Box
              data-ws-id="11"
              data-ws-component="Box"
              tag={"nav"}
              role={"navigation"}
              className="w-box"
            >
              <Box data-ws-id="14" data-ws-component="Box" className="w-box">
                <DialogTitle
                  data-ws-id="16"
                  data-ws-component="DialogTitle"
                  className="w-dialog-title"
                >
                  {"Sheet Title"}
                </DialogTitle>
                <DialogDescription
                  data-ws-id="18"
                  data-ws-component="DialogDescription"
                  className="w-dialog-description"
                >
                  {"Sheet description text you can edit"}
                </DialogDescription>
              </Box>
              <Text data-ws-id="20" data-ws-component="Text" className="w-text">
                {"The text you can edit"}
              </Text>
            </Box>
            <DialogClose
              data-ws-id="21"
              data-ws-component="DialogClose"
              className="w-dialog-close"
            >
              <HtmlEmbed
                data-ws-id="23"
                data-ws-component="HtmlEmbed"
                code={
                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" style="display: block;"><path fill-rule="evenodd" d="M13.566 2.434a.8.8 0 0 1 0 1.132L9.13 8l4.435 4.434a.8.8 0 0 1-1.132 1.132L8 9.13l-4.434 4.435a.8.8 0 0 1-1.132-1.132L6.87 8 2.434 3.566a.8.8 0 0 1 1.132-1.132L8 6.87l4.434-4.435a.8.8 0 0 1 1.132 0Z" clip-rule="evenodd"/></svg>'
                }
                className="w-html-embed"
              />
            </DialogClose>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </Box>
  );
};

export default {
  title: "Components/Sheet",
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
  :where(button.w-button) {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    border-top-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-left-style: solid;
    text-transform: none;
    margin: 0
  }
  :where(div.w-html-embed) {
    display: contents
  }
  :where(div.w-dialog-overlay) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(div.w-dialog-content) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(h2.w-dialog-title) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
  }
  :where(p.w-dialog-description) {
    box-sizing: border-box;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 1px;
    outline-width: 1px
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
  :where(button.w-dialog-close) {
    background-color: transparent;
    background-image: none;
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    box-sizing: border-box;
    text-transform: none;
    border: 1px solid rgba(226, 232, 240, 1);
    margin: 0;
    padding: 0px
  }
}
@media all {
  [data-ws-id="3"] {
    background-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    color: currentColor;
    height: 2.5rem;
    width: 2.5rem;
    padding-left: 0.375rem;
    padding-right: 0.375rem;
    padding-top: 0px;
    padding-bottom: 0px;
    border: 0px solid rgba(226, 232, 240, 1)
  }
  [data-ws-id="3"]:disabled {
    pointer-events: none;
    opacity: 0.5
  }
  [data-ws-id="3"]:focus-visible {
    outline-offset: 2px;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(148, 163, 184, 1);
    outline: 2px solid transparent
  }
  [data-ws-id="3"]:hover {
    background-color: rgba(241, 245, 249, 0.9);
    color: rgba(15, 23, 42, 1)
  }
  [data-ws-id="7"] {
    position: fixed;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    z-index: 50;
    background-color: rgba(255, 255, 255, 0.8);
    -webkit-backdrop-filter: blur(0 1px 2px 0 rgb(0 0 0 / 0.05));
    backdrop-filter: blur(0 1px 2px 0 rgb(0 0 0 / 0.05));
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    overflow-y: auto
  }
  [data-ws-id="9"] {
    width: 100%;
    z-index: 50;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    column-gap: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    position: relative;
    margin-right: auto;
    max-width: 24rem;
    flex-grow: 1;
    border: 1px solid rgba(226, 232, 240, 1);
    padding: 1.5rem
  }
  [data-ws-id="14"] {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    column-gap: 0.25rem
  }
  [data-ws-id="16"] {
    margin-top: 0px;
    margin-bottom: 0px;
    line-height: 1.75rem;
    font-size: 1.125rem;
    letter-spacing: -0.025em
  }
  [data-ws-id="18"] {
    margin-top: 0px;
    margin-bottom: 0px;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(100, 116, 139, 1)
  }
  [data-ws-id="21"] {
    position: absolute;
    right: 1rem;
    top: 1rem;
    border-top-left-radius: 0.125rem;
    border-top-right-radius: 0.125rem;
    border-bottom-right-radius: 0.125rem;
    border-bottom-left-radius: 0.125rem;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1rem;
    width: 1rem;
    background-color: transparent;
    outline-offset: 2px;
    outline: 2px solid transparent;
    border: 0px solid rgba(226, 232, 240, 1)
  }
  [data-ws-id="21"]:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(148, 163, 184, 1)
  }
  [data-ws-id="21"]:hover {
    opacity: 1
  }
}
      `}
        </style>
        <Component />
      </>
    );
  },
};

export { Story as Sheet };
