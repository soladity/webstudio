import { useState } from "react";
import {
  Box,
  SidebarTabs,
  SidebarTabsContent,
  SidebarTabsList,
  SidebarTabsTrigger,
} from "@webstudio-is/design-system";
import { useSubscribe, type Publish } from "~/shared/pubsub";
import { useDragAndDropState } from "~/shared/nano-states";
import { panels } from "./panels";
import type { TabName } from "./types";
import { useClientSettings } from "~/builder/shared/client-settings";
import { Flex } from "@webstudio-is/design-system";
import { theme } from "@webstudio-is/design-system";
import { BugIcon } from "@webstudio-is/icons";

const none = { TabContent: () => null };

type SidebarLeftProps = {
  publish: Publish;
};

export const SidebarLeft = ({ publish }: SidebarLeftProps) => {
  const [dragAndDropState] = useDragAndDropState();
  const [activeTab, setActiveTab] = useState<TabName>("none");
  const { TabContent } = activeTab === "none" ? none : panels[activeTab];
  const [clientSettings] = useClientSettings();

  useSubscribe("clickCanvas", () => {
    setActiveTab("none");
  });
  useSubscribe("dragEnd", () => {
    setActiveTab("none");
  });

  const enabledPanels = (Object.keys(panels) as Array<TabName>).filter(
    (panel) => {
      switch (panel) {
        case "navigator":
          return clientSettings.navigatorLayout === "docked";
      }
      return true;
    }
  );

  return (
    <Flex grow>
      <SidebarTabs activationMode="manual" value={activeTab}>
        <SidebarTabsList>
          {enabledPanels.map((tabName: TabName) => (
            <SidebarTabsTrigger
              aria-label={tabName}
              key={tabName}
              value={tabName}
              onClick={() => {
                setActiveTab(activeTab !== tabName ? tabName : "none");
              }}
            >
              {tabName === "none" ? null : panels[tabName].icon}
            </SidebarTabsTrigger>
          ))}
        </SidebarTabsList>
        <Box css={{ borderRight: `1px solid  ${theme.colors.borderMain}` }}>
          <SidebarTabsTrigger
            as={"button"}
            aria-label={"Report bug"}
            onClick={() => {
              window.open(
                "https://github.com/webstudio-is/webstudio/discussions/new?category=q-a&labels=bug&title=[Bug]"
              );
            }}
          >
            <BugIcon size={22} />
          </SidebarTabsTrigger>
        </Box>

        <SidebarTabsContent
          value={activeTab === "none" ? "" : activeTab}
          css={{
            zIndex: theme.zIndices[1],
            width: theme.spacing[30],
            // We need the node to be rendered but hidden
            // to keep receiving the drag events.
            visibility:
              dragAndDropState.isDragging &&
              dragAndDropState.dragPayload?.origin === "panel"
                ? "hidden"
                : "visible",
          }}
        >
          <TabContent publish={publish} onSetActiveTab={setActiveTab} />
        </SidebarTabsContent>
      </SidebarTabs>
    </Flex>
  );
};
