import {
  TreeNodeLabel,
  TreeNode,
  IconButton,
} from "@webstudio-is/design-system";
import { type Publish } from "~/shared/pubsub";
import { NewPageIcon, PageIcon } from "@webstudio-is/icons";
import type { TabName } from "../../types";
import { CloseButton, Header } from "../../lib/header";
import { type Page, type Pages } from "@webstudio-is/project";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Config } from "~/config";
import {
  useCurrentPageId,
  usePages,
  useProject,
} from "~/designer/shared/nano-states";
import { SettingsPanel } from "./settings-panel";
import { NewPageSettings } from "./settings";

type TabContentProps = {
  onSetActiveTab: (tabName: TabName) => void;
  publish: Publish;
  config: Config;
};

type PagesTreeNode =
  | {
      // currently used only for root node
      type: "folder";
      id: string;
      children: PagesTreeNode[];
    }
  | {
      type: "page";
      id: string;
      data: Page;
    };

const toTreeData = (pages: Pages): PagesTreeNode => {
  return {
    type: "folder",
    id: "root",
    children: [pages.homePage, ...pages.pages].map((data) => ({
      type: "page",
      id: data.id,
      data,
    })),
  };
};

const staticTreeProps = {
  getItemChildren(node: PagesTreeNode) {
    if (node.type === "folder") {
      return node.children;
    }
    return [];
  },
  getIsExpanded(_node: PagesTreeNode) {
    return true;
  },
  renderItem(props: { data: PagesTreeNode; isSelected: boolean }) {
    if (props.data.type === "folder") {
      return null;
    }

    return (
      <>
        <TreeNodeLabel
          isSelected={props.isSelected}
          text={props.data.data.name}
        />
      </>
    );
  },
};

const PagesPanel = ({
  onClose,
  onNewPage,
  onSelect,
  selectedPageId,
}: {
  onClose?: () => void;
  onNewPage?: () => void;
  onSelect: (pageId: string) => void;
  selectedPageId: string;
}) => {
  const [pages] = usePages();
  const pagesTree = useMemo(() => pages && toTreeData(pages), [pages]);

  if (pagesTree === undefined) {
    return null;
  }

  return (
    <>
      <Header
        title="Pages"
        suffix={
          <>
            {onNewPage && (
              <IconButton
                size="2"
                onClick={() => onNewPage()}
                aria-label="New Page"
              >
                <NewPageIcon />
              </IconButton>
            )}
            {onClose && <CloseButton onClick={onClose} />}
          </>
        }
      />
      <TreeNode
        hideRoot
        selectedItemId={selectedPageId}
        onSelect={onSelect}
        itemData={pagesTree}
        {...staticTreeProps}
      />
    </>
  );
};

export const TabContent = (props: TabContentProps) => {
  const [currentPageId] = useCurrentPageId();
  const [project] = useProject();

  const navigate = useNavigate();
  const handleSelect = (pageId: string) => {
    if (project === undefined) {
      return;
    }
    navigate(`${props.config.designerPath}/${project.id}?pageId=${pageId}`);
  };

  const [newPageOpen, setNewPageOpen] = useState(false);

  if (currentPageId === undefined || project === undefined) {
    return null;
  }

  return (
    <>
      <PagesPanel
        onClose={() => props.onSetActiveTab("none")}
        onNewPage={() => setNewPageOpen((current) => !current)}
        onSelect={handleSelect}
        selectedPageId={currentPageId}
      />
      <SettingsPanel isOpen={newPageOpen}>
        <NewPageSettings
          projectId={project.id}
          onClose={() => setNewPageOpen(false)}
          onSuccess={(page) => {
            setNewPageOpen(false);
            handleSelect(page.id);
          }}
        />
      </SettingsPanel>
    </>
  );
};

export const icon = <PageIcon />;
