import { useStore } from "@nanostores/react";
import { ChevronRightIcon } from "@webstudio-is/icons";
import {
  theme,
  DeprecatedButton,
  Flex,
  DeprecatedText2,
} from "@webstudio-is/design-system";
import {
  instancesStore,
  selectedInstanceSelectorStore,
} from "~/shared/nano-states";
import { getAncestorInstanceSelector } from "~/shared/tree-utils";

type BreadcrumbProps = {
  children: JSX.Element | string;
  onClick?: () => void;
};

const Breadcrumb = ({ children, onClick }: BreadcrumbProps) => {
  return (
    <>
      <DeprecatedButton
        ghost
        onClick={onClick}
        css={{
          color: theme.colors.hiContrast,
          px: theme.spacing[5],
          borderRadius: "100vh",
          height: "100%",
        }}
      >
        {children}
      </DeprecatedButton>
      <ChevronRightIcon color="white" />
    </>
  );
};

export const Breadcrumbs = () => {
  const instances = useStore(instancesStore);
  const selectedInstanceSelector = useStore(selectedInstanceSelectorStore);

  return (
    <Flex align="center" css={{ height: "100%" }}>
      {selectedInstanceSelector === undefined ? (
        <Breadcrumb>
          <DeprecatedText2>No instance selected</DeprecatedText2>
        </Breadcrumb>
      ) : (
        selectedInstanceSelector
          // start breadcrumbs from the root
          .slice()
          .reverse()
          .map((instanceId) => {
            const instance = instances.get(instanceId);
            if (instance === undefined) {
              return;
            }
            return (
              <Breadcrumb
                key={instance.id}
                onClick={() => {
                  selectedInstanceSelectorStore.set(
                    getAncestorInstanceSelector(
                      selectedInstanceSelector,
                      instance.id
                    )
                  );
                }}
              >
                {instance.component}
              </Breadcrumb>
            );
          })
      )}
    </Flex>
  );
};
