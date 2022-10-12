export type BuildMode = "edit" | "preview" | "published";
const modes = ["edit", "preview", "published"] as BuildMode[];
const getMode = (url: URL): BuildMode => {
  const modeParam = url.searchParams.get("mode");
  const mode =
    modeParam === null ? "published" : modes.find((mode) => mode === modeParam);
  if (mode === undefined) {
    throw new Error(`Invalid mode "${modeParam}"`);
  }
  return mode;
};

// A subtype of Request. To make testing easier.
type MinimalRequest = {
  url: string;
  headers: { get: (name: string) => string | null };
};

const getRequestHost = (request: MinimalRequest): string =>
  request.headers.get("x-forwarded-host") || request.headers.get("host") || "";

export const getBuildOrigin = (
  request: MinimalRequest,
  env = process.env
): string => {
  const { BUILD_ORIGIN } = env;
  if (BUILD_ORIGIN !== undefined && BUILD_ORIGIN !== "") {
    return BUILD_ORIGIN;
  }

  // Local development special case
  const host = getRequestHost(request);
  if (
    env.NODE_ENV === "development" &&
    /^(.*\.)?localhost(:\d+)?$/.test(host)
  ) {
    return `http://${host.split(".").pop()}`;
  }

  // Vercel preview special case
  if (
    (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") &&
    typeof env.VERCEL_URL === "string"
  ) {
    return `https://${env.VERCEL_URL}`;
  }

  throw new Error("Could not determine user content host");
};

export const getBuildParams = (
  request: MinimalRequest
):
  | {
      projectId: string;
      mode: BuildMode;
      pathname: string;
    }
  | {
      projectDomain: string;
      mode: BuildMode;
      pathname: string;
    }
  | undefined => {
  const url = new URL(request.url);

  const requestHost = getRequestHost(request);
  const buildHost = new URL(getBuildOrigin(request)).host;

  if (process.env.BUILD_REQUIRE_SUBDOMAIN !== "true") {
    const projectId = url.searchParams.get("projectId");
    if (projectId !== null && buildHost === requestHost) {
      return {
        projectId,
        mode: getMode(url),
        pathname: url.pathname,
      };
    }
  }

  const [projectDomain, ...rest] = requestHost.split(".");
  const baseHost = rest.join(".");
  if (baseHost === buildHost) {
    return {
      projectDomain,
      mode: getMode(url),
      pathname: url.pathname,
    };
  }

  return;
};
