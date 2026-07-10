"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteScriptButton({
  slug,
  title,
  redirectTo,
  apiBasePath = "/api/admin/scripts",
}: {
  slug: string;
  title: string;
  redirectTo?: string;
  apiBasePath?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function deleteScript() {
    const confirmed = window.confirm(
      `确认删除剧本「${title}」？剧本记录和专属素材文件夹都会被删除。`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${apiBasePath}/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除剧本失败");
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "删除剧本失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={deleteScript}
      disabled={deleting}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {deleting ? "删除中" : "删除"}
    </button>
  );
}
