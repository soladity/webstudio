import { Box } from "@webstudio-is/design-system";
import type { Instance, Publish } from "@webstudio-is/react-sdk";
import { useSelectedInstanceData } from "~/designer/shared/nano-states";
import { SortableTree } from "~/designer/shared/tree";
import { useRootInstance } from "~/shared/nano-states";
import { Header } from "../header";

type NavigatorProps = {
  publish: Publish;
  isClosable?: boolean;
  onClose?: () => void;
};

export const Navigator = ({ publish, isClosable, onClose }: NavigatorProps) => {
  const [selectedInstanceData] = useSelectedInstanceData();
  const [rootInstance] = useRootInstance();

  if (rootInstance === undefined) return null;
  return (
    <>
      <Header title="Navigator" onClose={onClose} isClosable={isClosable} />
      <Box css={{ padding: "$1" }}>
        <SortableTree
          root={rootInstance}
          selectedInstanceId={selectedInstanceData?.id}
          onSelect={(instance) => {
            publish<"selectInstanceById", Instance["id"]>({
              type: "selectInstanceById",
              payload: instance.id,
            });
          }}
          onDragEnd={(payload) => {
            publish<
              "reparentInstance",
              {
                instanceId: Instance["id"];
                dropTarget: {
                  instanceId: Instance["id"];
                  position: number | "end";
                };
              }
            >({ type: "reparentInstance", payload });
          }}
        />
      </Box>
    </>
  );
};
