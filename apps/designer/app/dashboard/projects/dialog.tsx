import {
  Flex,
  Dialog as BaseDialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
  theme,
} from "@webstudio-is/design-system";

type DialogProps = {
  title: string;
  children: JSX.Element | Array<JSX.Element>;
  trigger?: JSX.Element;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
};

export const Dialog = ({
  title,
  children,
  trigger,
  onOpenChange,
  isOpen,
}: DialogProps) => {
  return (
    <BaseDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        {children}
        <DialogTitle>{title}</DialogTitle>
      </DialogContent>
    </BaseDialog>
  );
};

export const DialogActions = ({
  children,
}: {
  children: Array<JSX.Element>;
}) => {
  return (
    <Flex
      gap="1"
      css={{
        padding: theme.spacing["9"],
        paddingTop: theme.spacing["5"],
        // Making sure the tab order is the last item first.
        flexFlow: "row-reverse",
      }}
    >
      {children}
    </Flex>
  );
};

export { DialogClose, DialogDescription };
