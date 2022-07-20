require("./env-check");

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  // This makes sure remix bundles monorepo packages which are always
  // sym-linked and can't be hoisted. You could also manually name packages
  // e.g. ["@webstudio-is/ui", ...]
  serverDependenciesToBundle: [/@webstudio-is\/.*/],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  watchPaths: () => {
    return ["../../packages/webstudio-react-sdk/lib/**/*"];
  },
};
