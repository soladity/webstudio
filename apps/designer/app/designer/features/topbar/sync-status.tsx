import {
  Flex,
  keyframes,
  AccessibleIcon,
} from "apps/designer/app/shared/design-system";
import { CheckIcon, DotsHorizontalIcon } from "apps/designer/app/shared/icons";
import { useSyncStatus } from "../../shared/nano-states";

const iconSize = 15;

const ellipsisKeyframes = keyframes({
  to: { width: iconSize },
});

const AnimatedDotsIcon = () => {
  return (
    <Flex
      direction="column"
      css={{
        animation: `${ellipsisKeyframes} steps(4,end) 900ms infinite`,
        width: 0,
        overflow: "hidden",
      }}
    >
      <DotsHorizontalIcon width="12" height="12" />
    </Flex>
  );
};

export const SyncStatus = () => {
  const [status] = useSyncStatus();
  return (
    <Flex
      align="center"
      justify="center"
      css={{
        mx: "$1",
        width: iconSize,
        height: iconSize,
        backgroundColor: "$green9",
        borderRadius: "100%",
      }}
    >
      <AccessibleIcon label={`Sync status: ${status}`}>
        {status === "syncing" ? <AnimatedDotsIcon /> : <CheckIcon />}
      </AccessibleIcon>
    </Flex>
  );
};
