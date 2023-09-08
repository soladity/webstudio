import { exit, argv } from "node:process";
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from "yargs/helpers";
import { GLOBAL_CONFIG_FILE } from "./config";
import { ensureFileInPath } from "./fs-utils";
import { link, linkOptions } from "./commands/link";
import { sync } from "./commands/sync";
import { build, buildOptions } from "./commands/build";
import { initFlow } from "./commands/init-flow";
import makeCLI from "yargs";
import packageJson from "../package.json" assert { type: "json" };
import type { CommonYargsArgv } from "./commands/yargs-types";

export const main = async () => {
  try {
    await ensureFileInPath(GLOBAL_CONFIG_FILE, "{}");

    const cmd: CommonYargsArgv = makeCLI(hideBin(argv))
      .strict()
      .fail(function (msg, err, yargs) {
        if (err) {
          throw err; // preserve stack
        }
        // eslint-disable-next-line no-console
        console.error(msg);
        // eslint-disable-next-line no-console
        console.error(yargs.help());

        process.exit(1);
      })
      .wrap(null)
      .option("v", {
        describe: "Show version number",
        type: "boolean",
      })
      .option("h", {
        describe: "Show all commands",
        alias: "help",
        type: "boolean",
      })
      .scriptName("webstudio-cli")
      .usage(
        `Webstudio CLI (${packageJson.version}) allows you to setup, sync, build and preview your project.`
      );

    cmd.version(packageJson.version).alias("v", "version");

    cmd.command(["build"], "Build the project", buildOptions, build);
    cmd.command(["link"], "Link the project with the cloud", linkOptions, link);
    cmd.command(["sync"], "Sync your project", {}, sync);
    cmd.command(["$0", "init"], "Setup the project", buildOptions, initFlow);

    await cmd.parse();
  } catch (error) {
    console.error(error);
    exit(1);
  }
};
