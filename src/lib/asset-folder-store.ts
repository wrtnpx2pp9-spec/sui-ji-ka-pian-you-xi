import { promises as fs } from "fs";
import path from "path";
import { readScripts, writeScripts } from "./script-store";
import type { AssetType, DemoAsset } from "./types";

const scriptAssetRootDir = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "public/assets/scripts",
);
const imageAssetExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

export const storedAssetTypes: AssetType[] = [
  "background",
  "cover",
  "character",
  "expression",
  "pose",
  "prop",
  "ui",
];

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `script-${Date.now()}`;
}

function uniqueAssetKey(baseKey: string, assets: DemoAsset[]) {
  let key = baseKey || `asset-${Date.now()}`;
  let index = 2;

  while (assets.some((asset) => asset.key === key)) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  return key;
}

function toAssetFolderName(slug: string) {
  return toSlug(slug).replace(/-+/g, "-") || `script-${Date.now()}`;
}

function toPublicAssetUrl(segments: string[]) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function getAssetFolder(slug: string) {
  const folderName = toAssetFolderName(slug);
  const localPath = path.join(scriptAssetRootDir, folderName);
  const publicPath = toPublicAssetUrl(["assets", "scripts", folderName]);

  return {
    folderName,
    localPath,
    publicPath,
  };
}

export function getStoredAssetFolderInfo(slug: string) {
  const folder = getAssetFolder(slug);

  return {
    ...folder,
    subfolders: storedAssetTypes.map((type) => ({
      type,
      localPath: path.join(folder.localPath, type),
      publicPath: `${folder.publicPath}/${type}`,
    })),
  };
}

export async function ensureStoredAssetFolders(slug: string) {
  const folder = getStoredAssetFolderInfo(slug);

  await fs.mkdir(folder.localPath, { recursive: true });
  await Promise.all(
    storedAssetTypes.map((type) =>
      fs.mkdir(path.join(folder.localPath, type), { recursive: true }),
    ),
  );

  return folder;
}

export async function deleteStoredAssetFolder(slug: string) {
  const folder = getStoredAssetFolderInfo(slug);
  const resolvedRoot = path.resolve(scriptAssetRootDir);
  const resolvedFolder = path.resolve(folder.localPath);

  if (
    resolvedFolder === resolvedRoot ||
    !resolvedFolder.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error("Refusing to delete asset folder outside script assets");
  }

  await fs.rm(resolvedFolder, { recursive: true, force: true });

  return folder;
}

function getSafeAssetExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return imageAssetExtensions.has(extension) ? extension : "";
}

function toAssetFileBaseName(fileName: string) {
  const parsed = path.parse(fileName);
  return toSlug(parsed.name) || `asset-${Date.now()}`;
}

async function getUniqueAssetFilePath(
  directory: string,
  baseName: string,
  extension: string,
) {
  let fileName = `${baseName}${extension}`;
  let filePath = path.join(directory, fileName);
  let index = 2;

  while (true) {
    try {
      await fs.access(filePath);
      fileName = `${baseName}-${index}${extension}`;
      filePath = path.join(directory, fileName);
      index += 1;
    } catch {
      return { fileName, filePath };
    }
  }
}

export async function saveStoredAssetFile({
  slug,
  assetType,
  fileName,
  buffer,
}: {
  slug: string;
  assetType: AssetType;
  fileName: string;
  buffer: Buffer;
}) {
  if (!storedAssetTypes.includes(assetType)) {
    throw new Error("Invalid asset type");
  }

  const extension = getSafeAssetExtension(fileName);

  if (!extension) {
    throw new Error("Unsupported asset file type");
  }

  const folder = await ensureStoredAssetFolders(slug);
  const targetDir = path.join(folder.localPath, assetType);
  const baseName = toAssetFileBaseName(fileName);
  const target = await getUniqueAssetFilePath(targetDir, baseName, extension);

  await fs.writeFile(target.filePath, buffer);

  return {
    name: path.parse(target.fileName).name,
    key: baseName,
    fileUrl: toPublicAssetUrl([
      "assets",
      "scripts",
      folder.folderName,
      assetType,
      target.fileName,
    ]),
  };
}

async function walkAssetFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkAssetFiles(fullPath);
      }

      if (
        entry.isFile() &&
        imageAssetExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function inferAssetTypeFromFile(
  rootPath: string,
  filePath: string,
): AssetType {
  const relativeParts = path.relative(rootPath, filePath).split(path.sep);
  const folderType = relativeParts[0] as AssetType;

  return storedAssetTypes.includes(folderType) ? folderType : "background";
}

export async function importStoredAssetsFromFolder(slug: string) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const folder = await ensureStoredAssetFolders(slug);
  const files = await walkAssetFiles(folder.localPath);
  const script = scripts[scriptIndex];
  const existingUrls = new Set(script.assets.map((asset) => asset.fileUrl));
  const imported: DemoAsset[] = [];

  for (const [index, filePath] of files.entries()) {
    const relativeParts = path
      .relative(folder.localPath, filePath)
      .split(path.sep);
    const fileUrl = toPublicAssetUrl([
      "assets",
      "scripts",
      folder.folderName,
      ...relativeParts,
    ]);

    if (existingUrls.has(fileUrl)) {
      continue;
    }

    const parsed = path.parse(filePath);
    const asset: DemoAsset = {
      id: `asset-${Date.now()}-${index}`,
      key: uniqueAssetKey(toSlug(parsed.name), script.assets),
      name: parsed.name,
      type: inferAssetTypeFromFile(folder.localPath, filePath),
      fileUrl,
      status: "approved",
    };

    script.assets.push(asset);
    existingUrls.add(fileUrl);
    imported.push(asset);
  }

  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return {
    script,
    imported,
    folder,
  };
}
