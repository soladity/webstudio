import { renderToString } from "react-dom/server";
import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { prisma } from "@webstudio-is/prisma-client";
import { initSentry } from "./shared/sentry";
import { handleRequest as handleRequestBuilder } from "./shared/remix";
import { getBuildParams } from "./shared/router-utils";

initSentry({
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

const handleRequestCanvas = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) => {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
};

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let handle = handleRequestBuilder;

  // @todo canvas can be deployed as separate app
  // and separate request handler will not be necessary anymore
  if (
    remixContext.staticHandlerContext.matches.some(
      (match) => match.route.id === "routes/_index"
    ) &&
    getBuildParams(request) !== undefined
  ) {
    handle = handleRequestCanvas;
  }

  return handle(request, responseStatusCode, responseHeaders, remixContext);
}
