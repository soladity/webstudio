require("./env-check");

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  publicPath: "/build/",
  serverBuildPath: "api/index.js",
  serverMainFields: ["main", "module"],
  serverModuleFormat: "cjs",
  serverPlatform: "node",
  serverMinify: false,

  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  // This makes sure remix bundles monorepo packages which are always
  // sym-linked and can't be hoisted. You could also manually name packages
  // e.g. ["@webstudio-is/ui", ...]
  serverDependenciesToBundle: [
    /@webstudio-is\/(?!prisma-client)/,
    "pretty-bytes",
    "djb2a",
    "nanoevents",
    "nanostores",
    "@nanostores/react",
    /micromark/,
    "decode-named-character-reference",
    "character-entities",
    /mdast-/,
    "unist-util-stringify-position",
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  watchPaths: () => {
    return ["../../packages/**/lib/**.js"];
  },

  future: {
    v2_errorBoundary: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
  },
};
