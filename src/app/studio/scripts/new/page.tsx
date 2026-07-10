import { NewScriptForm } from "@/components/admin/new-script-form";
import { StudioShell } from "@/components/studio/studio-shell";
import { getCreatorSession } from "@/lib/creator-auth";
import { redirect } from "next/navigation";

export default async function NewStudioScriptPage() {
  const session = await getCreatorSession();

  if (!session) {
    redirect("/studio/login");
  }

  return (
    <StudioShell
      title="创建作品"
      description="从一个开场节点开始，慢慢把剧情、角色和美术填完整。"
      session={session}
    >
      <NewScriptForm
        apiBasePath="/api/studio/scripts"
        redirectBasePath="/studio/scripts"
      />
    </StudioShell>
  );
}
