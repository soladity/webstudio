import type { AppContext } from "@webstudio-is/trpc-interface/index.server";
import env from "~/env/env.server";
import { authenticator } from "~/services/auth.server";
import { trpcClient } from "~/services/trpc.server";

const createAuthorizationContext = async (
  request: Request,
  buildEnv: AppContext["authorization"]["buildEnv"]
): Promise<AppContext["authorization"]> => {
  const url = new URL(request.url);

  const authToken = url.searchParams.get("authToken") ?? url.hostname;

  const user = await authenticator.isAuthenticated(request);

  const context: AppContext["authorization"] = {
    userId: user?.id,
    authToken,
    buildEnv,
    authorizeTrpc: trpcClient.authorize,
  };

  return context;
};

const createDomainContext = (request: Request) => {
  const context: AppContext["domain"] = {
    domainTrpc: trpcClient.domain,
  };

  return context;
};

const createDeploymentContext = (request: Request) => {
  const url = new URL(request.url);

  const context: AppContext["deployment"] = {
    deploymentTrpc: trpcClient.deployment,
    env: {
      BUILDER_ORIGIN: url.origin,
      BRANCH_NAME: env.BRANCH_NAME ?? "main",
    },
  };

  return context;
};

/**
 * argument buildEnv==="prod" only if we are loading project with production build
 */
export const createContext = async (
  request: Request,
  buildEnv: AppContext["authorization"]["buildEnv"] = "dev"
): Promise<AppContext> => {
  const authorization = await createAuthorizationContext(request, buildEnv);
  const domain = createDomainContext(request);
  const deployment = createDeploymentContext(request);

  return {
    authorization,
    domain,
    deployment,
  };
};
