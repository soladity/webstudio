import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import {
  Box,
  Flex,
  Collapsible,
  SectionTitle,
  SectionTitleLabel,
  SectionTitleButton,
} from "@webstudio-is/design-system";
import { theme } from "@webstudio-is/design-system";
import type { ComponentProps, ReactNode } from "react";
import { PlusIcon } from "@webstudio-is/icons";

type UseOpenStateProps = {
  label: string;
  isOpenDefault?: boolean;
  isOpen?: boolean;
};

const stateContainer = atom<{ [label: string]: boolean }>({});

// Preserves the open/close state even when component gets unmounted
const useOpenState = ({
  label,
  isOpenDefault = true,
  isOpen: isOpenForced,
}: UseOpenStateProps): [boolean, (value: boolean) => void] => {
  const state = useStore(stateContainer);
  const isOpen = label in state ? state[label] : isOpenDefault;
  const setIsOpen = (isOpen: boolean) => {
    stateContainer.set({ ...state, [label]: isOpen });
  };
  return [isOpenForced === undefined ? isOpen : isOpenForced, setIsOpen];
};

type BaseProps = {
  trigger?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
  label: string;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
};

const CollapsibleSectionBase = ({
  label,
  trigger,
  children,
  fullWidth = false,
  isOpen,
  onOpenChange,
}: BaseProps) => (
  <Collapsible.Root open={isOpen} onOpenChange={onOpenChange}>
    <Box css={{ boxShadow: `0px 1px 0 ${theme.colors.panelOutline}` }}>
      <Collapsible.Trigger asChild>
        {trigger ?? (
          <SectionTitle>
            <SectionTitleLabel>{label}</SectionTitleLabel>
          </SectionTitle>
        )}
      </Collapsible.Trigger>

      <Collapsible.Content asChild>
        <Flex
          gap="3"
          direction="column"
          css={{
            pb: theme.spacing[9],
            px: fullWidth ? 0 : theme.spacing[9],
            paddingTop: 0,
            "&:empty": { display: "none" },
          }}
        >
          {children}
        </Flex>
      </Collapsible.Content>
    </Box>
  </Collapsible.Root>
);

type CollapsibleSectionProps = Omit<BaseProps, "isOpen" | "onOpenChange"> &
  UseOpenStateProps;

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
  const { label, trigger, children, fullWidth } = props;
  const [isOpen, setIsOpen] = useOpenState(props);
  return (
    <CollapsibleSectionBase
      label={label}
      trigger={trigger}
      fullWidth={fullWidth}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {children}
    </CollapsibleSectionBase>
  );
};

export const CollapsibleSectionWithAddButton = ({
  onAdd,
  hasItems = true,
  ...props
}: Omit<CollapsibleSectionProps, "trigger"> & {
  onAdd: () => void;

  /**
   * If set to `true`, dots aren't shown,
   * but still affects how isOpen is treated and whether onAdd is called on open.
   */
  hasItems?: boolean | ComponentProps<typeof SectionTitle>["dots"];
}) => {
  const { label, children, fullWidth } = props;
  const [isOpen, setIsOpen] = useOpenState(props);

  const isEmpty =
    hasItems === false || (Array.isArray(hasItems) && hasItems.length === 0);

  // If it's open but empty, we want it to look as closed
  const isOpenFinal = isOpen && isEmpty === false;

  return (
    <CollapsibleSectionBase
      label={label}
      fullWidth={fullWidth}
      isOpen={isOpenFinal}
      onOpenChange={(nextIsOpen) => {
        setIsOpen(nextIsOpen);
        if (isEmpty) {
          onAdd?.();
        }
      }}
      trigger={
        <SectionTitle
          dots={Array.isArray(hasItems) ? hasItems : []}
          suffix={
            <SectionTitleButton
              prefix={<PlusIcon />}
              onClick={() => {
                if (isOpenFinal === false) {
                  setIsOpen(true);
                }
                onAdd();
              }}
            />
          }
        >
          <SectionTitleLabel>{props.label}</SectionTitleLabel>
        </SectionTitle>
      }
    >
      {children}
    </CollapsibleSectionBase>
  );
};
