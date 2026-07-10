import Image from "next/image";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AssetRequirementPanel } from "@/components/admin/asset-requirement-panel";
import { AssetForm } from "@/components/admin/asset-form";
import { AssetFolderTools } from "@/components/admin/asset-folder-tools";
import { StatusPill } from "@/components/ui/status-pill";
import { getScriptAssetRequirements } from "@/lib/asset-requirements";
import { getStoredAssetFolderInfo } from "@/lib/asset-folder-store";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  const assetFolder = getStoredAssetFolderInfo(script.slug);
  const requirements = getScriptAssetRequirements(script);

  return (
    <AdminShell
      title="美术资源"
      description="先登记可复用的背景、封面、角色立绘和道具，再到节点编辑页把场景图绑定到具体剧情节点。"
    >
      <AssetRequirementPanel requirements={requirements} />

      <AssetFolderTools
        slug={script.slug}
        folderPath={assetFolder.localPath}
        publicPath={assetFolder.publicPath}
        characters={script.characters}
      />

      <AssetForm slug={script.slug} characters={script.characters} />

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {["background", "character", "cover", "prop"].map((type) => (
          <div key={type} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="text-2xl font-semibold">
              {script.assets.filter((asset) => asset.type === type).length}
            </div>
            <div className="mt-1 text-sm text-zinc-500">{type}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {script.assets.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
          >
            <div className="relative aspect-[4/3] bg-zinc-100">
              <Image
                src={asset.fileUrl}
                alt={asset.name}
                fill
                className="object-contain p-3"
              />
            </div>
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                  {asset.type}
                </span>
                <StatusPill status={asset.status} />
              </div>
              <h2 className="font-semibold">{asset.name}</h2>
              <p className="mt-1 truncate text-xs text-zinc-500">
                {asset.fileUrl}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {asset.emotion ?? asset.key}
              </p>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
