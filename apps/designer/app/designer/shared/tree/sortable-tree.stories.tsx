import { ComponentMeta } from "@storybook/react";
import { Instance } from "@webstudio-is/react-sdk";
import { useState } from "react";
import produce from "immer";
import { createInstance, reparentInstanceMutable } from "~/shared/tree-utils";
import { SortableTree } from "./sortable-tree";
import { Flex } from "@webstudio-is/design-system";

export const StressTest = ({ animate }: { animate: boolean }) => {
  const [root, setRoot] = useState<Instance>(() => {
    return createInstance({
      component: "Body",
      children: Array.from({ length: 100 }, () =>
        createInstance({
          component: "Box",
          children: [
            createInstance({ component: "Heading" }),
            createInstance({ component: "Paragraph" }),
            createInstance({
              component: "Box",
              children: [
                createInstance({
                  component: "Box",
                  children: [
                    createInstance({
                      component: "Box",
                      children: [
                        createInstance({ component: "Heading" }),
                        createInstance({ component: "Paragraph" }),
                      ],
                    }),
                  ],
                }),
                createInstance({ component: "Box" }),
              ],
            }),
          ],
        })
      ),
    });
  });

  const [selectedInstanceId, setSelectedInstanceId] = useState<
    string | undefined
  >();

  return (
    <Flex css={{ width: 300, height: 500, flexDirection: "column" }}>
      <SortableTree
        animate={animate}
        root={root}
        selectedInstanceId={selectedInstanceId}
        onSelect={(instance) => setSelectedInstanceId(instance.id)}
        onDragEnd={(payload) =>
          setRoot(
            produce((draft) =>
              reparentInstanceMutable(
                draft,
                payload.instanceId,
                payload.dropTarget.instanceId,
                payload.dropTarget.position
              )
            )
          )
        }
      />
    </Flex>
  );
};

export default {
  args: { animate: true },
} as ComponentMeta<typeof SortableTree>;
