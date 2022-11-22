import fetch from "isomorphic-fetch";
import type { Project } from "./index.d";

export const loadProject = async ({
  apiUrl,
  projectId,
}: {
  apiUrl: string;
  projectId: string;
}): Promise<Project | string> => {
  try {
    if (apiUrl === undefined) {
      throw new Error("Webstudio API URL is required.");
    }
    const baseUrl = new URL(apiUrl);
    const projectUrl = new URL(`/rest/project/${projectId}`, baseUrl);
    const projectResponse = await fetch(projectUrl);
    const project = await projectResponse.json();
    if (!projectResponse.ok) {
      throw new Error(project);
    }
    return project;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }
    return "Unknown error";
  }
};
