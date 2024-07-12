import { styled, theme } from "@webstudio-is/design-system";
import { useRef, useState } from "react";
import type { StyleInfo } from "../../shared/style-info";
import type {
  CreateBatchUpdate,
  DeleteProperty,
  SetProperty,
} from "../../shared/use-style-data";
import { Section } from "./transitions";

const Panel = styled("div", {
  width: theme.spacing[30],
  boxShadow: theme.shadows.panelSectionDropShadow,
});

const useStyleInfo = (styleInfoInitial: StyleInfo) => {
  const [styleInfo, setStyleInfo] = useState(() => styleInfoInitial);

  const setProperty: SetProperty = (name) => (value, options) => {
    if (options?.isEphemeral) {
      return;
    }

    setStyleInfo((styleInfo) => ({
      ...styleInfo,
      [name]: {
        ...styleInfo[name],
        value: value,
        local: value,
      },
    }));
  };

  const deleteProperty: DeleteProperty = (name, options) => {
    if (options?.isEphemeral) {
      return;
    }

    setStyleInfo((styleInfo) => {
      const { [name]: _, ...rest } = styleInfo;
      return rest;
    });
  };

  const execCommands = useRef<(() => void)[]>([]);

  const createBatchUpdate: CreateBatchUpdate = () => ({
    deleteProperty: (property) => {
      execCommands.current.push(() => {
        deleteProperty(property);
      });
    },
    setProperty: (property) => (style) => {
      execCommands.current.push(() => {
        setProperty(property)(style);
      });
    },
    publish: (options) => {
      if (options?.isEphemeral) {
        execCommands.current = [];
        return;
      }

      for (const command of execCommands.current) {
        command();
      }

      execCommands.current = [];
    },
  });

  return { styleInfo, setProperty, deleteProperty, createBatchUpdate };
};

export const Transitions = () => {
  const { styleInfo, setProperty, deleteProperty, createBatchUpdate } =
    useStyleInfo({
      transitionProperty: {
        value: {
          type: "layers",
          value: [
            { type: "unparsed", value: "opacity" },
            { type: "unparsed", value: "transform" },
            { type: "keyword", value: "all" },
          ],
        },
      },
    });

  return (
    <Panel>
      <Section
        currentStyle={styleInfo}
        setProperty={setProperty}
        deleteProperty={deleteProperty}
        createBatchUpdate={createBatchUpdate}
      />
    </Panel>
  );
};

export default {
  title: "Style Panel/Transitions",
  component: Transitions,
};
