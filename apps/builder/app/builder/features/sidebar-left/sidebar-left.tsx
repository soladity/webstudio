import { useRef, useState, type ReactNode } from "react";
import { Box, Kbd, rawTheme, Text } from "@webstudio-is/design-system";
import { useSubscribe, type Publish } from "~/shared/pubsub";
import { $dragAndDropState, $isPreviewMode } from "~/shared/nano-states";
import { Flex } from "@webstudio-is/design-system";
import { theme } from "@webstudio-is/design-system";
import {
  AiIcon,
  ExtensionIcon,
  HelpIcon,
  ImageIcon,
  NavigatorIcon,
  PageIcon,
  PlusIcon,
  type IconComponent,
} from "@webstudio-is/icons";
import { HelpPopover } from "./help-popover";
import { useStore } from "@nanostores/react";
import {
  $activeSidebarPanel,
  setActiveSidebarPanel,
  toggleActiveSidebarPanel,
  type SidebarPanelName,
} from "~/builder/shared/nano-states";
import {
  SidebarButton,
  SidebarTabs,
  SidebarTabsContent,
  SidebarTabsList,
  SidebarTabsTrigger,
} from "./sidebar-tabs";
import {
  ExternalDragDropMonitor,
  POTENTIAL,
  isBlockedByBackdrop,
  useOnDropEffect,
  useExternalDragStateEffect,
} from "~/builder/shared/assets/drag-monitor";
import { getSetting, setSetting } from "~/builder/shared/client-settings";
import { ComponentsPanel } from "./panels/components";
import { PagesPanel } from "./panels/pages";
import { NavigatorPanel } from "./panels/navigator";
import { AssetsPanel } from "./panels/assets";
import { MarketplacePanel } from "./panels/marketplace";

const none = { Panel: () => null };

const AiTabTrigger = () => {
  return (
    <SidebarButton
      label="AI"
      data-state={getSetting("isAiCommandBarVisible") ? "active" : undefined}
      onClick={() => {
        setSetting(
          "isAiCommandBarVisible",
          getSetting("isAiCommandBarVisible") ? false : true
        );
      }}
    >
      <AiIcon size={rawTheme.spacing[10]} />
    </SidebarButton>
  );
};

const HelpTabTrigger = () => {
  const [helpIsOpen, setHelpIsOpen] = useState(false);
  return (
    <HelpPopover onOpenChange={setHelpIsOpen}>
      <HelpPopover.Trigger asChild>
        <SidebarButton
          label="Learn Webstudio or ask for help"
          data-state={helpIsOpen ? "active" : undefined}
        >
          <HelpIcon size={rawTheme.spacing[10]} />
        </SidebarButton>
      </HelpPopover.Trigger>
    </HelpPopover>
  );
};

type PanelConfig = {
  name: SidebarPanelName;
  label: ReactNode;
  Icon: IconComponent;
  Panel: (props: { publish: Publish; onClose: () => void }) => ReactNode;
};

const panels: PanelConfig[] = [
  {
    name: "components",
    label: (
      <Text>
        Components&nbsp;&nbsp;
        <Kbd value={["A"]} color="moreSubtle" />
      </Text>
    ),
    Icon: PlusIcon,
    Panel: ComponentsPanel,
  },
  {
    name: "pages",
    label: "Pages",
    Icon: PageIcon,
    Panel: PagesPanel,
  },
  {
    name: "navigator",
    label: (
      <Text>
        Navigator&nbsp;&nbsp;
        <Kbd value={["z"]} color="moreSubtle" />
      </Text>
    ),
    Icon: NavigatorIcon,
    Panel: NavigatorPanel,
  },
  {
    name: "assets",
    label: "Assets",
    Icon: ImageIcon,
    Panel: AssetsPanel,
  },
  {
    name: "marketplace",
    label: "Marketplace",
    Icon: ExtensionIcon,
    Panel: MarketplacePanel,
  },
];

type SidebarLeftProps = {
  publish: Publish;
};

export const SidebarLeft = ({ publish }: SidebarLeftProps) => {
  const activePanel = useStore($activeSidebarPanel);
  const dragAndDropState = useStore($dragAndDropState);
  const { Panel } = panels.find((item) => item.name === activePanel) ?? none;
  const isPreviewMode = useStore($isPreviewMode);
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const returnTabRef = useRef<SidebarPanelName | undefined>(undefined);

  useSubscribe("dragEnd", () => {
    setActiveSidebarPanel("none");
  });

  useOnDropEffect(() => {
    const element = tabsWrapperRef.current;

    if (element == null) {
      return;
    }

    if (isBlockedByBackdrop(element)) {
      return;
    }

    returnTabRef.current = undefined;
  });

  useExternalDragStateEffect((state) => {
    if (state !== POTENTIAL) {
      if (returnTabRef.current !== undefined) {
        setActiveSidebarPanel(returnTabRef.current);
      }
      returnTabRef.current = undefined;
      return;
    }

    const element = tabsWrapperRef.current;

    if (element == null) {
      return;
    }

    if (isBlockedByBackdrop(element)) {
      return;
    }

    returnTabRef.current = activePanel;
    // Save prevous state
    setActiveSidebarPanel("assets");
  });

  return (
    <Flex grow>
      <SidebarTabs
        activationMode="manual"
        value={activePanel}
        orientation="vertical"
      >
        {
          // In preview mode, we don't show left sidebar, but we want to allow pages panel to be open in the preview mode.
          // This way user can switch pages without exiting preview mode.
        }
        {isPreviewMode === false && (
          <>
            <ExternalDragDropMonitor />
            <div ref={tabsWrapperRef} style={{ display: "contents" }}>
              <SidebarTabsList>
                {panels.map(({ name, Icon, label }) => {
                  return (
                    <SidebarTabsTrigger
                      key={name}
                      label={label}
                      value={name}
                      onClick={() => {
                        toggleActiveSidebarPanel(name);
                      }}
                    >
                      <Icon size={rawTheme.spacing[10]} />
                    </SidebarTabsTrigger>
                  );
                })}
              </SidebarTabsList>
            </div>

            <Box css={{ borderRight: `1px solid ${theme.colors.borderMain}` }}>
              <AiTabTrigger />
              <HelpTabTrigger />
            </Box>
          </>
        )}

        <SidebarTabsContent
          value={activePanel === "none" ? "" : activePanel}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setActiveSidebarPanel("none");
            }
          }}
          css={{
            width: theme.spacing[30],
            // We need the node to be rendered but hidden
            // to keep receiving the drag events.
            visibility:
              dragAndDropState.isDragging &&
              dragAndDropState.dragPayload?.origin === "panel" &&
              getSetting("navigatorLayout") !== "undocked"
                ? "hidden"
                : "visible",
          }}
        >
          <Flex
            css={{
              position: "relative",
              height: "100%",
              flexGrow: 1,
              background: theme.colors.backgroundPanel,
            }}
            direction="column"
          >
            <Panel
              publish={publish}
              onClose={() => setActiveSidebarPanel("none")}
            />
          </Flex>
        </SidebarTabsContent>
      </SidebarTabs>
    </Flex>
  );
};
