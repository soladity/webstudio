import { renderToString } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { insertCriticalCss } from "./critical-css";
import type { EntryContext } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import { initSentry } from "./shared/sentry";
import { prisma } from "./shared/db/prisma.server";

initSentry({
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  markup = insertCriticalCss(markup, request.url);

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
