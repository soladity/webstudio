/* eslint-disable @typescript-eslint/no-var-requires */
import { Decimal } from "@prisma/client/runtime";

const commonAsset = {
  id: "sa-546",
  width: new Decimal(200),
  height: new Decimal(200),
  projectId: "id",
  size: 2135,
  format: "png",
  createdAt: new Date(),
  alt: "",
};

describe("getAssetPath", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      S3_ACCESS_KEY_ID: "testid",
      S3_SECRET_ACCESS_KEY: "testkey",
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("local", () => {
    test("returns local path with no custom path", () => {
      const { getAssetPath } = require("./get-asset-path");
      expect(
        getAssetPath({
          ...commonAsset,
          name: "test.png",
          location: "FS",
        })
      ).toBe("/uploads/test.png");
    });

    test("return local path with custom path", () => {
      process.env.FILE_UPLOAD_PATH = "assets";
      const { getAssetPath } = require("./get-asset-path");
      expect(
        getAssetPath({
          ...commonAsset,
          name: "test.png",
          location: "FS",
        })
      ).toBe("/assets/test.png");
    });
  });
  describe("s3", () => {
    test("returns s3 url", () => {
      process.env.S3_ENDPOINT = "https://fr1.s3.com";
      process.env.S3_BUCKET = "bucket";
      process.env.S3_REGION = "fr1";
      const { getAssetPath } = require("./get-asset-path");
      expect(
        getAssetPath({
          ...commonAsset,
          name: "test.png",
          location: "REMOTE",
        })
      ).toBe("https://bucket.fr1.s3.com/test.png");
    });
    test("returns s3 url and fixes extra slashes", () => {
      process.env.S3_ENDPOINT = "https://fr1.s3.com//";
      process.env.S3_BUCKET = "bucket";
      process.env.S3_REGION = "fr1";
      const { getAssetPath } = require("./get-asset-path");
      expect(
        getAssetPath({
          ...commonAsset,
          name: "test.png",
          location: "REMOTE",
        })
      ).toBe("https://bucket.fr1.s3.com/test.png");
    });
  });
  describe("R2", () => {
    test("returns r2 url", () => {
      process.env.S3_ENDPOINT = "https://userid.r2.cloudflarestorage.com";
      process.env.S3_BUCKET = "bucket";
      process.env.S3_REGION = "auto";
      process.env.WORKER_URL = "https://worker-test.workers.dev";
      const { getAssetPath } = require("./get-asset-path");
      expect(
        getAssetPath({
          ...commonAsset,
          name: "test.png",
          location: "REMOTE",
        })
      ).toBe("https://worker-test.workers.dev/test.png");
    });
  });
});
