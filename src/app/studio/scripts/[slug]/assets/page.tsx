import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssetRequirementPanel } from "@/components/admin/asset-requirement-panel";
import { AssetForm } from "@/components/admin/asset-form";
import { AssetFolderTools } from "@/components/admin/asset-folder-tools";
import { StatusPill } from "@/components/ui/status-pill";
import { StudioShell } from "@/components/studio/studio-shell";
import { getScriptAssetRequirements } from "@/lib/asset-requirements";
import { getCreatorSession, assertCanEditScript } from "@/lib/creator-auth";
import { getStoredAssetFolderInfo } from "@/lib/asset-folder-store";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function StudioAssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getCreatorSession();

  if (!session) {
    redirect("/studio/login");
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  try {
    assertCanEditScript(session, script);
  } catch {
    notFound();
  }

  const assetFolder = getStoredAssetFolderInfo(script.slug);
  const requirements = getScriptAssetRequirements(script);

  return (
    <StudioShell
      title="美术资产"
      description="在这里上传、同步和登记作品素材。先补封面和背景，再处理角色默认立绘和对白表情。"
      session={session}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/studio/scripts/${script.slug}`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
          返回作品页
        </Link>
        <StatusPill status={script.status} />
      </div>

      <AssetRequirementPanel requirements={requirements} />

      <AssetFolderTools
        slug={script.slug}
        folderPath={assetFolder.localPath}
        publicPath={assetFolder.publicPath}
        characters={script.characters}
        apiBasePath="/api/studio/scripts"
      />

      <AssetForm
        slug={script.slug}
        characters={script.characters}
        apiBasePath="/api/studio/scripts"
      />

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
    </StudioShell>
  );
}
