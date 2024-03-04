import { Root as SdkRoot } from "@webstudio-is/react-sdk";
import { useEffect } from "react";

/**
 * Custom root so we can add some custom logic for specific resurces etc like analytics, etc.
 */
const Root = (props: React.ComponentProps<typeof SdkRoot>) => {
  useEffect(() => {
    console.info("Hello, world!");
  }, []);

  return <SdkRoot {...props} />;
};

export default Root;
