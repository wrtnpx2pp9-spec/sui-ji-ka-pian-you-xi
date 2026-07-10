import Image from "next/image";
import { notFound } from "next/navigation";
import { CharacterAiSettings } from "@/components/admin/character-ai-settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  return (
    <AdminShell
      title="角色管理"
      description="管理角色设定、剧情功能和多表情/多姿势立绘。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {script.characters.map((character) => {
          const asset = script.assets.find(
            (item) => item.id === character.defaultAssetId,
          );
          const variants = script.assets.filter(
            (item) => item.characterId === character.id,
          );

          return (
            <article
              key={character.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="relative mx-auto h-64 max-w-52">
                {asset ? (
                  <Image
                    src={asset.fileUrl}
                    alt={asset.name}
                    fill
                    className="object-contain"
                  />
                ) : null}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal-700">
                  {character.roleType}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{character.name}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {character.description}
                </p>
                <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                  <div className="mb-1 font-medium text-zinc-900">剧情功能</div>
                  {character.narrativeFunction}
                </div>
                <div className="mt-3 text-sm text-zinc-500">
                  已绑定 {variants.length} 张角色图
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <CharacterAiSettings script={script} />
    </AdminShell>
  );
}
