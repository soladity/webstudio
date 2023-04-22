import { useEffect } from "react";
import { useBeforeUnload } from "react-use";
import { sync } from "immerhin";
import type { Project } from "@webstudio-is/project";
import type { Build } from "@webstudio-is/project-build";
import type { AuthPermit } from "@webstudio-is/trpc-interface/index.server";
import { restPatchPath } from "~/shared/router-utils";
import { enqueue, dequeue, queueStatus } from "./queue";

// Periodic check for new entries to group them into one job/call in sync queue.
const NEW_ENTRIES_INTERVAL = 1000;

// First attempts we will simply retry without changing the state or notifying anyone.
const INTERVAL_RECOVERY = 2000;

// When we reached max failed attempts we will slow down the attempts interval.
const INTERVAL_ERROR = 5000;

const useRecoveryCheck = () => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (queueStatus.get() === "recovering") {
        dequeue();
      }
    }, INTERVAL_RECOVERY);

    return () => clearInterval(intervalId);
  }, []);
};

const useErrorCheck = () => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (queueStatus.get() === "failed") {
        dequeue();
      }
    }, INTERVAL_ERROR);

    return () => clearInterval(intervalId);
  }, []);
};

const useNewEntriesCheck = ({
  buildId,
  projectId,
  authToken,
  authPermit,
}: UserSyncServerProps) => {
  useEffect(() => {
    if (authPermit === "view") {
      return;
    }

    // @todo setInterval can be completely avoided.
    // Right now prisma can't do atomic updates yet with sandbox documents
    // and backend fetches and updates big objects, so if we send quickly,
    // we end up overwriting things
    const intervalId = setInterval(() => {
      const transactions = sync();

      if (transactions.length === 0) {
        return;
      }

      enqueue(() =>
        fetch(restPatchPath({ authToken }), {
          method: "post",
          body: JSON.stringify({
            transactions,
            buildId,
            projectId,
          }),
        })
      );
    }, NEW_ENTRIES_INTERVAL);

    return () => clearInterval(intervalId);
  }, [buildId, projectId, authToken, authPermit]);
};

type UserSyncServerProps = {
  buildId: Build["id"];
  projectId: Project["id"];
  authToken: string | undefined;
  authPermit: AuthPermit;
};

export const useSyncServer = (props: UserSyncServerProps) => {
  useNewEntriesCheck(props);
  useRecoveryCheck();
  useErrorCheck();
  useBeforeUnload(
    () => queueStatus.get() !== "idle",
    "You have unsaved changes. Are you sure you want to leave?"
  );
};
