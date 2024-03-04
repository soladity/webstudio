import type { ActionArgs } from "@remix-run/node";
import { findAuthenticatedUser } from "~/services/auth.server";
import { createContext } from "~/shared/context.server";
import { marketplaceRouter } from "~/shared/marketplace/router";
import { handleTrpcRemixAction } from "~/shared/remix/trpc-remix-request.server";

export const action = async ({ request, params }: ActionArgs) => {
  const authenticatedUser = await findAuthenticatedUser(request);
  if (authenticatedUser === null) {
    throw new Error("Not authenticated");
  }
  const context = await createContext(request);

  return await handleTrpcRemixAction({
    request,
    params,
    router: marketplaceRouter,
    context,
  });
};

export const loader = action;
