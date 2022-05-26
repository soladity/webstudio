import { useState, useCallback } from "react";
import { useSubscribe, type Publish } from "@webstudio-is/sdk";
import {
  Box,
  SidebarTabs,
  SidebarTabsContent,
  SidebarTabsList,
  SidebarTabsTrigger,
} from "~/shared/design-system";
import { useSelectedInstanceData } from "../../shared/nano-values";
import * as panels from "./panels";
import type { TabName } from "./types";

const sidebarTabsContentStyle = {
  position: "absolute",
  left: "100%",
  width: 250,
  height: "100%",
  bc: "$loContrast",
  outline: "1px solid $slate6",
};

const none = { TabContent: () => null };

type SidebarLeftProps = {
  onDragChange: (isDragging: boolean) => void;
  publish: Publish;
};

export const SidebarLeft = ({ onDragChange, publish }: SidebarLeftProps) => {
  const [selectedInstanceData] = useSelectedInstanceData();
  const [activeTab, setActiveTab] = useState<TabName>("none");
  const [isDragging, setIsDragging] = useState(false);
  const { TabContent } = activeTab === "none" ? none : panels[activeTab];

  useSubscribe<"clickCanvas">("clickCanvas", () => {
    setActiveTab("none");
  });
  useSubscribe("dragStartInstance", () => {
    setIsDragging(true);
  });
  useSubscribe("dragEndInstance", () => {
    setIsDragging(false);
  });

  const handleDragChange = useCallback(
    (isDragging: boolean) => {
      // After dragging is done, container is going to become visible
      // and we need to close it for good.
      if (isDragging === false) setActiveTab("none");
      setIsDragging(isDragging);
      onDragChange(isDragging);
    },
    [onDragChange]
  );

  return (
    <Box css={{ position: "relative", zIndex: 1 }}>
      <SidebarTabs activationMode="manual" value={activeTab}>
        <SidebarTabsList>
          {(Object.keys(panels) as Array<TabName>).map((tabName: TabName) => (
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
            ...sidebarTabsContentStyle,
            // We need the node to be rendered but hidden
            // to keep receiving the drag events.
            visibility: isDragging ? "hidden" : "visible",
            overflow: "auto",
          }}
        >
          <TabContent
            selectedInstanceData={selectedInstanceData}
            publish={publish}
            onSetActiveTab={setActiveTab}
            onDragChange={handleDragChange}
          />
        </SidebarTabsContent>
      </SidebarTabs>
    </Box>
  );
};
