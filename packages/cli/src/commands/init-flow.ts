import { ensureFolderExists, isFileExists } from "../fs-utils";
import { chdir, cwd, stdout as shellOutput } from "node:process";
import { spawn } from "node:child_process";
import { join } from "node:path";
import ora from "ora";
import { link } from "./link";
import { sync } from "./sync";
import { build, buildOptions } from "./build";
import { prompt } from "../prompts";
import type { StrictYargsOptionsToInterface } from "./yargs-types";

export const initFlow = async (
  options: StrictYargsOptionsToInterface<typeof buildOptions>
) => {
  const isProjectConfigured = await isFileExists(".webstudio/config.json");
  let shouldInstallDeps = false;

  if (isProjectConfigured === false) {
    const { shouldCreateFolder } = await prompt({
      type: "confirm",
      name: "shouldCreateFolder",
      message: "Would you like to create a folder?",
      initial: true,
    });

    if (shouldCreateFolder === true) {
      const { folderName } = await prompt({
        type: "text",
        name: "folderName",
        message: "Please enter a project name",
      });

      if (folderName === undefined) {
        throw new Error("Folder name is required");
      }
      await ensureFolderExists(join(cwd(), folderName));
      chdir(join(cwd(), folderName));
    }

    const { projectLink } = await prompt({
      type: "text",
      name: "projectLink",
      message: "Please paste a link from the share dialog in the builder",
    });

    if (projectLink === undefined) {
      throw new Error(`Project Link is required`);
    }
    await link({ link: projectLink });

    const { installDeps } = await prompt({
      type: "confirm",
      name: "installDeps",
      message: "Would you like to install dependencies?",
      initial: true,
    });
    shouldInstallDeps = installDeps;
  }

  await sync();
  await build(options);

  if (shouldInstallDeps === true) {
    const spinner = ora().start();
    spinner.text = "Installing dependencies";
    const { stderr } = await exec("npm", ["install"]);
    if (stderr) {
      throw stderr;
    }
    spinner.succeed("Installed dependencies, starting dev server");

    const { stderr: devServerError } = await exec("npm", ["run", "dev"]);
    if (devServerError) {
      throw devServerError;
    }
  }
};

const exec = (
  command: string,
  args?: ReadonlyArray<string>
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = "";
    let stderr = "";
    process.on("error", reject);
    process.on("exit", (code) => {
      if (code !== 0) {
        reject({ stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });

    process.stderr.setEncoding("utf8");
    process.stdout.setEncoding("utf8");
    process.stdout.on("data", (data) => {
      stdout += data;
      shellOutput.write(data);
    });
    process.stderr.on("error", (error) => (stderr += error));
  });
};
