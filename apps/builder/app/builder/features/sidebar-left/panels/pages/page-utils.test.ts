import { describe, expect, test } from "@jest/globals";
import type { Project } from "@webstudio-is/project";
import { createDefaultPages } from "@webstudio-is/project-build";
import { isRoot, type Folder, Instance } from "@webstudio-is/sdk";
import {
  cleanupChildRefsMutable,
  deleteFolderWithChildrenMutable,
  getAllChildrenAndSelf,
  isSlugUsed,
  registerFolderChildMutable,
  reparentOrphansMutable,
  toTreeData,
  filterSelfAndChildren,
  getExistingRoutePaths,
  duplicatePage,
} from "./page-utils";
import {
  $dataSources,
  $instances,
  $pages,
  $project,
} from "~/shared/nano-states";
import { registerContainers } from "~/shared/sync";
import { encodeDataSourceVariable } from "@webstudio-is/react-sdk";

registerContainers();

const toMap = <T extends { id: string }>(list: T[]) =>
  new Map(list.map((item) => [item.id, item]));

describe("toTreeData", () => {
  test("initial pages always has home pages and a root folder", () => {
    const pages = createDefaultPages({
      rootInstanceId: "id",
      homePageId: "homePageId",
    });
    const tree = toTreeData(pages);
    expect(tree.root).toEqual({
      id: "root",
      name: "Root",
      slug: "",
      type: "folder",
      children: [
        {
          data: {
            id: "homePageId",
            meta: {},
            name: "Home",
            path: "",
            rootInstanceId: "id",
            title: `"Home"`,
          },
          id: "homePageId",
          type: "page",
        },
      ],
    });
  });

  test("add empty folder", () => {
    const pages = createDefaultPages({
      rootInstanceId: "id",
      homePageId: "homePageId",
    });
    pages.folders.push({
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: [],
    });
    const rootFolder = pages.folders.find(isRoot);
    rootFolder?.children.push("folderId");
    const tree = toTreeData(pages);
    expect(tree.root).toEqual({
      id: "root",
      name: "Root",
      slug: "",
      type: "folder",
      children: [
        {
          data: {
            id: "homePageId",
            meta: {},
            name: "Home",
            path: "",
            rootInstanceId: "id",
            title: `"Home"`,
          },
          id: "homePageId",
          type: "page",
        },
        {
          type: "folder",
          id: "folderId",
          name: "Folder",
          slug: "folder",
          children: [],
        },
      ],
    });
  });

  test("add a page inside a folder", () => {
    const pages = createDefaultPages({
      rootInstanceId: "id",
      homePageId: "homePageId",
    });
    pages.pages.push({
      id: "pageId",
      meta: {},
      name: "Page",
      path: "/page",
      rootInstanceId: "id",
      title: `"Page"`,
    });
    pages.folders.push({
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: ["pageId"],
    });
    const rootFolder = pages.folders.find(isRoot);
    rootFolder?.children.push("folderId");
    const tree = toTreeData(pages);

    expect(tree.root).toEqual({
      id: "root",
      name: "Root",
      slug: "",
      type: "folder",
      children: [
        {
          data: {
            id: "homePageId",
            meta: {},
            name: "Home",
            path: "",
            rootInstanceId: "id",
            title: `"Home"`,
          },
          id: "homePageId",
          type: "page",
        },
        {
          type: "folder",
          id: "folderId",
          name: "Folder",
          slug: "folder",
          children: [
            {
              type: "page",
              id: "pageId",
              data: {
                id: "pageId",
                meta: {},
                name: "Page",
                path: "/page",
                rootInstanceId: "id",
                title: `"Page"`,
              },
            },
          ],
        },
      ],
    });
  });

  test("nest a folder", () => {
    const pages = createDefaultPages({
      rootInstanceId: "id",
      homePageId: "homePageId",
    });
    const rootFolder = pages.folders.find(isRoot);
    rootFolder?.children.push("1");
    pages.folders.push({
      id: "1",
      name: "Folder 1",
      slug: "folder-1",
      children: ["1-1"],
    });
    pages.folders.push({
      id: "1-1",
      name: "Folder 1-1",
      slug: "folder-1-1",
      children: [],
    });
    const tree = toTreeData(pages);
    expect(tree.root).toEqual({
      type: "folder",
      id: "root",
      name: "Root",
      slug: "",
      children: [
        {
          type: "page",
          id: "homePageId",
          data: {
            id: "homePageId",
            name: "Home",
            path: "",
            title: `"Home"`,
            meta: {},
            rootInstanceId: "id",
          },
        },
        {
          type: "folder",
          id: "1",
          name: "Folder 1",
          slug: "folder-1",
          children: [
            {
              type: "folder",
              id: "1-1",
              name: "Folder 1-1",
              slug: "folder-1-1",
              children: [],
            },
          ],
        },
      ],
    });
  });
});

describe("reparentOrphansMutable", () => {
  // We must deal with the fact there can be an orphaned folder or page in a collaborative mode,
  // because user A can add a page to a folder while user B deletes the folder without receiving the create page yet.
  test("reparent orphans to the root", () => {
    const pages = createDefaultPages({
      rootInstanceId: "rootInstanceId",
      homePageId: "homePageId",
    });
    pages.pages.push({
      id: "pageId",
      meta: {},
      name: "Page",
      path: "/page",
      rootInstanceId: "rootInstanceId",
      title: `"Page"`,
    });
    pages.folders.push({
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: [],
    });
    reparentOrphansMutable(pages);
    const rootFolder = pages.folders.find(isRoot);
    expect(rootFolder).toEqual({
      id: "root",
      name: "Root",
      slug: "",
      children: ["homePageId", "folderId", "pageId"],
    });
  });
});

describe("cleanupChildRefsMutable", () => {
  test("cleanup refs", () => {
    const { folders } = createDefaultPages({
      rootInstanceId: "rootInstanceId",
      homePageId: "homePageId",
    });
    folders.push({
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: [],
    });
    const rootFolder = folders.find(isRoot);
    rootFolder?.children.push("folderId");
    cleanupChildRefsMutable("folderId", folders);
    expect(rootFolder).toEqual({
      id: "root",
      name: "Root",
      slug: "",
      children: ["homePageId"],
    });
  });
});

describe("isSlugUsed", () => {
  const { folders } = createDefaultPages({
    rootInstanceId: "rootInstanceId",
    homePageId: "homePageId",
  });
  folders.push({
    id: "folderId1",
    name: "Folder 1",
    slug: "slug1",
    children: ["folderId1-1"],
  });
  folders.push({
    id: "folderId1-1",
    name: "Folder 1-1",
    slug: "slug1-1",
    children: [],
  });

  const rootFolder = folders.find(isRoot)!;
  rootFolder.children.push("folderId1");

  test("available in the root", () => {
    expect(isSlugUsed("slug", folders, rootFolder.id)).toBe(true);
  });

  test("not available in the root", () => {
    expect(isSlugUsed("slug1", folders, rootFolder.id)).toBe(false);
  });

  test("available in Folder 1", () => {
    expect(isSlugUsed("slug", folders, "folderId1")).toBe(true);
  });

  test("not available in Folder 1", () => {
    expect(isSlugUsed("slug1-1", folders, "folderId1")).toBe(false);
  });

  test("existing folder can have a matching slug when its the same id/folder", () => {
    expect(isSlugUsed("slug1-1", folders, "folderId1", "folderId1-1")).toBe(
      true
    );
  });
});

describe("registerFolderChildMutable", () => {
  test("register a folder child in the root via fallback", () => {
    const { folders } = createDefaultPages({
      rootInstanceId: "rootInstanceId",
      homePageId: "homePageId",
    });
    registerFolderChildMutable(folders, "folderId");
    const rootFolder = folders.find(isRoot);
    expect(rootFolder?.children).toEqual(["homePageId", "folderId"]);
  });

  test("register a folder child in a provided folder", () => {
    const { folders } = createDefaultPages({
      rootInstanceId: "rootInstanceId",
      homePageId: "homePageId",
    });
    const folder = {
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: [],
    };
    folders.push(folder);
    registerFolderChildMutable(folders, "folderId2", "folderId");
    expect(folder.children).toEqual(["folderId2"]);
  });

  test("register in a provided folder & cleanup old refs", () => {
    const { folders } = createDefaultPages({
      rootInstanceId: "rootInstanceId",
      homePageId: "homePageId",
    });
    const folder = {
      id: "folderId",
      name: "Folder",
      slug: "folder",
      children: [],
    };
    folders.push(folder);
    const rootFolder = folders.find(isRoot);
    registerFolderChildMutable(folders, "folderId", "root");
    registerFolderChildMutable(folders, "folderId2", "root");

    expect(rootFolder?.children).toEqual([
      "homePageId",
      "folderId",
      "folderId2",
    ]);

    // Moving folderId from root to folderId
    registerFolderChildMutable(folders, "folderId2", "folderId");

    expect(rootFolder?.children).toEqual(["homePageId", "folderId"]);
    expect(folder.children).toEqual(["folderId2"]);
  });
});

describe("getAllChildrenAndSelf", () => {
  const folders: Array<Folder> = [
    {
      id: "1",
      name: "1",
      slug: "1",
      children: ["2"],
    },
    {
      id: "2",
      name: "2",
      slug: "2",
      children: ["3", "page1"],
    },
    {
      id: "3",
      name: "3",
      slug: "3",
      children: ["page2"],
    },
  ];

  test("get nested folders", () => {
    const result = getAllChildrenAndSelf("1", folders, "folder");
    expect(result).toEqual(["1", "2", "3"]);
  });

  test("get nested pages", () => {
    const result = getAllChildrenAndSelf("1", folders, "page");
    expect(result).toEqual(["page2", "page1"]);
  });
});

describe("deleteFolderWithChildrenMutable", () => {
  const folders = (): Array<Folder> => [
    {
      id: "1",
      name: "1",
      slug: "1",
      children: ["2"],
    },
    {
      id: "2",
      name: "2",
      slug: "2",
      children: ["3", "page1"],
    },
    {
      id: "3",
      name: "3",
      slug: "3",
      children: [],
    },
  ];

  test("delete empty folder", () => {
    const result = deleteFolderWithChildrenMutable("3", folders());
    expect(result).toEqual({ folderIds: ["3"], pageIds: [] });
  });

  test("delete folder with folders and pages", () => {
    const result = deleteFolderWithChildrenMutable("1", folders());
    expect(result).toEqual({
      folderIds: ["1", "2", "3"],
      pageIds: ["page1"],
    });
  });
});

describe("filterSelfAndChildren", () => {
  const folders = [
    {
      id: "1",
      name: "1",
      slug: "1",
      children: ["2"],
    },
    {
      id: "2",
      name: "2",
      slug: "2",
      children: ["page1"],
    },
    {
      id: "3",
      name: "3",
      slug: "3",
      children: [],
    },
  ];

  test("filter self and child folders", () => {
    const result = filterSelfAndChildren("1", folders);
    expect(result).toEqual([folders[2]]);
  });
});

describe("getExistingRoutePaths", () => {
  const pages = createDefaultPages({
    rootInstanceId: "rootInstanceId",
    homePageId: "homePageId",
  });

  test("gets all the route paths that exists in the project", () => {
    pages.pages.push({
      id: "pageId",
      meta: {},
      name: "Page",
      path: "/page",
      rootInstanceId: "rootInstanceId",
      title: `"Page"`,
    });

    pages.pages.push({
      id: "blogId",
      meta: {},
      name: "Blog",
      path: "/blog/:id",
      rootInstanceId: "rootInstanceId",
      title: `"Blog"`,
    });

    const result = getExistingRoutePaths(pages);
    expect(Array.from(result)).toEqual(["/page", "/blog/:id"]);
  });
});

describe("duplicate page", () => {
  $project.set({ id: "projectId" } as Project);

  test("home page with new root instance", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $pages.set({
      homePage: {
        id: "pageId",
        name: "My Name",
        path: "/",
        title: `"My Title"`,
        meta: {},
        rootInstanceId: "body",
      },
      pages: [],
      folders: [],
    });
    duplicatePage("pageId");
    expect($pages.get()?.pages[0]).toEqual({
      id: expect.not.stringMatching("pageId"),
      name: "My Name (1)",
      path: "/copy-1",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
    });
    expect($instances.get()).toEqual(
      toMap<Instance>([
        {
          type: "instance",
          id: "body",
          component: "Body",
          children: [],
        },
        {
          type: "instance",
          id: expect.not.stringMatching("body") as unknown as string,
          component: "Body",
          children: [],
        },
      ])
    );
  });

  test("non-home page preserving old path and name with prefix", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $pages.set({
      homePage: {
        id: "homeId",
        name: "Home",
        path: "/",
        title: `"Home"`,
        meta: {},
        rootInstanceId: "home",
      },
      pages: [
        {
          id: "pageId",
          name: "My Name (1)",
          path: "/my-path",
          title: `"My Title"`,
          meta: {},
          rootInstanceId: "body",
        },
      ],
      folders: [],
    });
    duplicatePage("pageId");
    expect($pages.get()?.pages[1]).toEqual({
      id: expect.not.stringMatching("pageId"),
      name: "My Name (2)",
      path: "/copy-1/my-path",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
    });
  });

  test("handle wildcards", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $pages.set({
      homePage: {
        id: "homeId",
        name: "Home",
        path: "/",
        title: `"Home"`,
        meta: {},
        rootInstanceId: "home",
      },
      pages: [
        {
          id: "pageId1",
          name: "My Name 1",
          path: "/my-path/*",
          title: `"My Title"`,
          meta: {},
          rootInstanceId: "body",
        },
        {
          id: "pageId2",
          name: "My Name 2",
          // Named wildcard
          path: "/my-path/name*",
          title: `"My Title"`,
          meta: {},
          rootInstanceId: "body",
        },
      ],
      folders: [],
    });
    duplicatePage("pageId1");
    duplicatePage("pageId2");
    expect($pages.get()?.pages[2]).toEqual({
      id: expect.not.stringMatching("pageId1"),
      name: "My Name 1 (1)",
      path: "/copy-1/my-path/*",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
    });
    expect($pages.get()?.pages[3]).toEqual({
      id: expect.not.stringMatching("pageId2"),
      name: "My Name 2 (1)",
      path: "/copy-1/my-path/name*",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
    });
  });

  test("check full page path when duplicating inside a folder", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $pages.set({
      homePage: {
        id: "homeId",
        name: "Home",
        path: "/",
        title: `"Home"`,
        meta: {},
        rootInstanceId: "home",
      },
      pages: [
        {
          id: "pageId",
          name: "My Name",
          path: "/my-path",
          title: `"My Title"`,
          meta: {},
          rootInstanceId: "body",
        },
      ],
      folders: [
        {
          id: "folderId",
          name: "Folder",
          slug: "folder",
          children: ["pageId"],
        },
      ],
    });
    duplicatePage("pageId");
    expect($pages.get()?.pages[1]).toEqual({
      id: expect.not.stringMatching("pageId"),
      name: "My Name (1)",
      path: "/copy-1/my-path",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
    });
  });

  test("replace variables in page meta", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $dataSources.set(
      toMap([
        {
          id: "variableId",
          scopeInstanceId: "body",
          name: "My Variable",
          type: "variable",
          value: { type: "string", value: "value" },
        },
      ])
    );
    $pages.set({
      homePage: {
        id: "pageId",
        name: "My Name",
        path: "/",
        title: `"Title: " + $ws$dataSource$variableId`,
        meta: {
          description: `"Description: " + $ws$dataSource$variableId`,
          excludePageFromSearch: `"Exclude: " + $ws$dataSource$variableId`,
          socialImageUrl: `"Image: " + $ws$dataSource$variableId`,
          custom: [
            {
              property: "Name",
              content: `"Name: " + $ws$dataSource$variableId`,
            },
          ],
        },
        rootInstanceId: "body",
      },
      pages: [],
      folders: [],
    });
    duplicatePage("pageId");
    const [_oldDataSource, newDataSource] = $dataSources.get().values();
    const newVariableName = encodeDataSourceVariable(newDataSource.id);
    expect(newVariableName).not.toEqual("$ws$dataSource$variableId");
    expect($pages.get()?.pages[0]).toEqual({
      id: expect.not.stringMatching("pageId"),
      name: "My Name (1)",
      path: "/copy-1",
      title: `"Title: " + ${newVariableName}`,
      meta: {
        description: `"Description: " + ${newVariableName}`,
        excludePageFromSearch: `"Exclude: " + ${newVariableName}`,
        socialImageUrl: `"Image: " + ${newVariableName}`,
        custom: [
          {
            property: "Name",
            content: `"Name: " + ${newVariableName}`,
          },
        ],
      },
      rootInstanceId: expect.not.stringMatching("body"),
    });
  });

  test("replace path params variable", () => {
    $instances.set(
      toMap([{ type: "instance", id: "body", component: "Body", children: [] }])
    );
    $dataSources.set(
      toMap([
        {
          id: "pathParamsId",
          scopeInstanceId: "body",
          name: "Path Params",
          type: "parameter",
        },
      ])
    );
    $pages.set({
      homePage: {
        id: "pageId",
        name: "My Name",
        path: "/",
        title: `"My Title"`,
        meta: {},
        rootInstanceId: "body",
        pathParamsDataSourceId: "pathParamsId",
      },
      pages: [],
      folders: [],
    });
    duplicatePage("pageId");
    const [_oldDataSource, newDataSource] = $dataSources.get().values();
    expect(newDataSource.id).not.toEqual("pathParamsId");
    expect($pages.get()?.pages[0]).toEqual({
      id: expect.not.stringMatching("pageId"),
      name: "My Name (1)",
      path: "/copy-1",
      title: `"My Title"`,
      meta: {},
      rootInstanceId: expect.not.stringMatching("body"),
      pathParamsDataSourceId: newDataSource.id,
    });
  });
});
