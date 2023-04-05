import * as Sentry from "@sentry/remix";
import type { Extras, Integration } from "@sentry/types";
import env from "~/shared/env";

// Disable sentry as it failed with production Remix 1.15.0
const SENTRY_ENABLED = false;

export const initSentry = ({
  integrations = [],
}: { integrations?: Integration[] } = {}) =>
  SENTRY_ENABLED && env.SENTRY_DSN
    ? Sentry.init({
        dsn: env.SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: env.DEPLOYMENT_ENVIRONMENT || "development",
        integrations: integrations,
      })
    : () => null;

type SentryHelperProps = {
  extras?: Extras;
  skipLogging?: boolean;
};

export const sentryMessage = ({
  message,
  extras,
  skipLogging = false,
}: SentryHelperProps & { message: string }) => {
  if (SENTRY_ENABLED && env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (extras) {
        scope.setExtras(extras);
      }
      Sentry.captureMessage(message);
    });
  }

  if (skipLogging !== true) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
};

export const sentryException = ({
  error,
  extras,
  skipLogging = false,
}: SentryHelperProps & { error: unknown }) => {
  if (SENTRY_ENABLED && env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (extras) {
        scope.setExtras(extras);
      }
      Sentry.captureException(error);
    });
  }
  if (skipLogging !== true) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
