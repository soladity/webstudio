import { useState } from "react";
import { useSubscribe, type Publish } from "~/shared/pubsub";
import {
  SidebarTabs,
  SidebarTabsContent,
  SidebarTabsList,
  SidebarTabsTrigger,
} from "@webstudio-is/design-system";
import { useDragAndDropState } from "~/shared/nano-states";
import { panels } from "./panels";
import type { TabName } from "./types";
import { isFeatureEnabled } from "~/shared/feature-flags";
import { useClientSettings } from "~/designer/shared/client-settings";
import { PANEL_WIDTH } from "~/designer/shared/constants";
import { Flex } from "@webstudio-is/design-system";
import { type Project, type Pages } from "@webstudio-is/project";
import { Config } from "~/config";

const none = { TabContent: () => null };

type SidebarLeftProps = {
  publish: Publish;
  project: Project;
  pages: Pages;
  currentPageId: string;
  config: Config;
};

export const SidebarLeft = ({
  publish,
  project,
  pages,
  currentPageId,
  config,
}: SidebarLeftProps) => {
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
        case "assets":
          return isFeatureEnabled("assets");
        case "pages":
          return isFeatureEnabled("pages");
        case "navigator":
          return clientSettings.navigatorLayout === "docked";
      }
      return true;
    }
  );

  return (
    <Flex>
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
        <SidebarTabsContent
          value={activeTab === "none" ? "" : activeTab}
          css={{
            zIndex: "$1",
            width: PANEL_WIDTH,
            // We need the node to be rendered but hidden
            // to keep receiving the drag events.
            visibility:
              dragAndDropState.isDragging && dragAndDropState.origin === "panel"
                ? "hidden"
                : "visible",
            overflow: "auto",
          }}
        >
          <TabContent
            publish={publish}
            onSetActiveTab={setActiveTab}
            project={project}
            pages={pages}
            currentPageId={currentPageId}
            config={config}
          />
        </SidebarTabsContent>
      </SidebarTabs>
    </Flex>
  );
};
