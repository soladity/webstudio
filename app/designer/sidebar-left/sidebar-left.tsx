import { useState, MutableRefObject } from "react";
import {
  Box,
  SidebarTabs,
  SidebarTabsContent,
  SidebarTabsList,
  SidebarTabsTrigger,
} from "~/shared/design-system";
import { useSubscribe, type Publish } from "~/designer/iframe";
import type { SelectedInstanceData } from "~/shared/component";
import { useRootInstance } from "../nano-values";
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
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  publish: Publish;
  selectedInstanceData?: SelectedInstanceData;
};

export const SidebarLeft = ({
  onDragChange,
  iframeRef,
  publish,
  selectedInstanceData,
}: SidebarLeftProps) => {
  const [activeTab, setActiveTab] = useState<TabName>("none");
  const [isDragging, setIsDragging] = useState(false);
  const [rootInstance] = useRootInstance();
  const { TabContent } = activeTab === "none" ? none : panels[activeTab];

  useSubscribe<"clickCanvas">("clickCanvas", () => {
    setActiveTab("none");
  });

  return (
    <Box css={{ position: "relative" }}>
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
          }}
        >
          <TabContent
            rootInstance={rootInstance}
            selectedInstanceData={selectedInstanceData}
            publish={publish}
            iframeRef={iframeRef}
            onSetActiveTab={setActiveTab}
            onDragChange={(isDragging: boolean) => {
              // After dragging is done, container is going to become visible
              // and we need to close it for good.
              if (isDragging === false) setActiveTab("none");
              setIsDragging(isDragging);
              onDragChange(isDragging);
            }}
          />
        </SidebarTabsContent>
      </SidebarTabs>
    </Box>
  );
};
