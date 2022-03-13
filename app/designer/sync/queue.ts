import { statusContainer } from "./status";

// @todo because of limitation with nested models and saving tree as a Json type
// we load that entire Json to manipulate and if a second request happens before the first one has written
// the result into the db, the second request will have outdated tree and will then write the outdated tree back
// to the database
// For now we will just have to queue the changes for all tree mutations.

type Job = () => Promise<unknown>;

const queue: Array<Job> = [];

export const enqueue = (job: Job) => {
  queue.push(job);
  if (isInProgress === false) dequeue();
};

let isInProgress = false;

const dequeue = () => {
  const job = queue.shift();
  if (job) {
    isInProgress = true;
    statusContainer.dispatch(isInProgress ? "syncing" : "idle");
    job().finally(() => {
      isInProgress = false;
      statusContainer.dispatch(isInProgress ? "syncing" : "idle");
      dequeue();
    });
  }
};
