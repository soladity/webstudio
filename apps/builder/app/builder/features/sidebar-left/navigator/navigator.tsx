import { useCallback } from "react";
import { useStore } from "@nanostores/react";
import { Flex } from "@webstudio-is/design-system";
import type { Instance } from "@webstudio-is/project-build";
import {
  selectedInstanceSelectorStore,
  hoveredInstanceIdStore,
  useRootInstance,
  instancesStore,
} from "~/shared/nano-states";
import { InstanceTree } from "~/builder/shared/tree";
import { reparentInstance } from "~/shared/instance-utils";
import { Header, CloseButton } from "../header";
import { getInstanceSelector } from "~/shared/tree-utils";

type NavigatorProps = {
  isClosable?: boolean;
  onClose?: () => void;
};

export const Navigator = ({ isClosable, onClose }: NavigatorProps) => {
  const selectedInstanceSelector = useStore(selectedInstanceSelectorStore);
  const selectedInstanceId = selectedInstanceSelector?.[0];
  const [rootInstance] = useRootInstance();

  const handleSelect = useCallback((instanceId: Instance["id"]) => {
    const instances = instancesStore.get();
    const instanceSelector = getInstanceSelector(instances, instanceId);
    selectedInstanceSelectorStore.set(instanceSelector);
  }, []);

  const handleDragEnd = useCallback(
    (payload: {
      itemId: string;
      dropTarget: { itemId: string; position: number | "end" };
    }) => {
      reparentInstance(payload.itemId, {
        parentId: payload.dropTarget.itemId,
        position: payload.dropTarget.position,
      });
    },
    []
  );

  const handleHover = useCallback((instance: Instance | undefined) => {
    hoveredInstanceIdStore.set(instance?.id);
  }, []);

  if (rootInstance === undefined) {
    return null;
  }
  return (
    <Flex css={{ height: "100%", flexDirection: "column" }}>
      <Header
        title="Navigator"
        suffix={isClosable && <CloseButton onClick={() => onClose?.()} />}
      />
      <Flex css={{ flexGrow: 1, flexDirection: "column" }}>
        <InstanceTree
          root={rootInstance}
          // @todo accept and provide in callback instance selector instead of just id
          selectedItemId={selectedInstanceId}
          onSelect={handleSelect}
          onHover={handleHover}
          onDragEnd={handleDragEnd}
        />
      </Flex>
    </Flex>
  );
};
