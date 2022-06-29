import { useEffect, useMemo } from "react";
import {
  useSubscribe,
  useUserProps,
  type Instance,
  toCss,
} from "@webstudio-is/sdk";
import { useCss } from "~/canvas/features/wrapper-component/use-css";
import { useBreakpoints } from "~/shared/nano-states";
import { primitives } from "../../canvas-components";
import { $createInstanceNode, InstanceNode } from "../nodes/node-instance";
import {
  createCommand,
  $isRangeSelection,
  $getSelection,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  useLexicalComposerContext,
  type LexicalCommand,
} from "../lexical";
import { toLexicalNodes } from "../utils/to-lexical-nodes";

const populateRoot = (children: Instance["children"]) => {
  const nodes = toLexicalNodes(children, InlineWrapperComponent);
  const root = $getRoot();
  root.clear();
  for (const node of nodes) {
    root.append(node);
  }
  root.selectStart();
};

const INSERT_INSTANCE_COMMAND: LexicalCommand<Instance> = createCommand();

type InstancePluginProps = {
  children: Instance["children"];
};

export const InstancePlugin = ({ children }: InstancePluginProps) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (editor.hasNodes([InstanceNode]) === false) {
      throw new Error("InstancePlugin: InstanceNode not registered on editor");
    }

    return editor.registerCommand<Instance>(
      INSERT_INSTANCE_COMMAND,
      (instance) => {
        const selection = $getSelection();
        const text = selection?.getTextContent();
        if ($isRangeSelection(selection) && text) {
          const instanceNode = $createInstanceNode({
            component: (
              <InlineWrapperComponent instance={instance}>
                {text}
              </InlineWrapperComponent>
            ),
            text,
          });
          selection.insertNodes([instanceNode]);
          // Dirty hack. When clicking on toolbar outside of the iframe, we are loosing focus.
          // For some reason we can only refocus after a delay
          requestAnimationFrame(() => {
            editor.update(() => {
              instanceNode.select();
            });
          });
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  useEffect(() => {
    editor.update(() => {
      populateRoot(children);
    });
  }, [editor, children]);

  useSubscribe<"insertInlineInstance", Instance>(
    "insertInlineInstance",
    (payload) => {
      editor.dispatchCommand<Instance>(INSERT_INSTANCE_COMMAND, payload);
    }
  );

  return null;
};

const InlineWrapperComponent = ({
  instance,
  ...rest
}: {
  instance: Instance;
  children: string;
}) => {
  const [breakpoints] = useBreakpoints();
  const css = useMemo(
    () => toCss(instance.cssRules, breakpoints),
    [instance, breakpoints]
  );
  const className = useCss({ instance, css });
  const userProps = useUserProps(instance.id);
  const { Component } = primitives[instance.component];

  return (
    <Component
      {...rest}
      {...userProps}
      key={instance.id}
      id={instance.id}
      className={className}
    />
  );
};
