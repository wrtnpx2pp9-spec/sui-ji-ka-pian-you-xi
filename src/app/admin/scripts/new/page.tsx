import { NewScriptForm } from "@/components/admin/new-script-form";
import { AdminShell } from "@/components/admin/admin-shell";

export default function NewScriptPage() {
  return (
    <AdminShell
      title="创建 DAG 剧本"
      description="从一个开场节点开始搭建剧情图。先添加节点和走向，系统会把每个节点自动补成可编辑场景。"
    >
      <NewScriptForm />
    </AdminShell>
  );
}
